import { useEffect, useMemo, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'
import { getJob, type JobStage } from '@/api/client'
import { SOCKET_URL } from '@/api/config'
import { applyJobSnapshot } from '@/features/queue/queueUtils'
import { useDownloadQueueStore } from '@/stores/downloadQueueStore'

export function useQueueSync() {
  const jobs = useDownloadQueueStore((s) => s.jobs)
  const hydrated = useDownloadQueueStore((s) => s.hydrated)
  const connected = useDownloadQueueStore((s) => s.connected)
  const updateJob = useDownloadQueueStore((s) => s.updateJob)
  const updateTrack = useDownloadQueueStore((s) => s.updateTrack)
  const setConnected = useDownloadQueueStore((s) => s.setConnected)
  const socketRef = useRef<Socket | null>(null)

  const runningIds = useMemo(
    () => jobs.filter((job) => job.status === 'running' || job.status === 'pending').map((job) => job.id),
    [jobs],
  )
  const runningKey = runningIds.join(',')

  useEffect(() => {
    if (!hydrated) return

    const socket = io(SOCKET_URL || window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })
    socketRef.current = socket

    const joinAll = () => {
      const ids = useDownloadQueueStore
        .getState()
        .jobs.filter((job) => job.status === 'running' || job.status === 'pending')
        .map((job) => job.id)
      ids.forEach((jobId) => socket.emit('join_job', { job_id: jobId }))
    }

    socket.on('connect', () => {
      setConnected(true)
      joinAll()
    })
    socket.on('disconnect', () => setConnected(false))

    socket.on('job:started', (data: { job_id?: string }) => {
      if (data.job_id) updateJob(data.job_id, { status: 'running' })
    })

    socket.on(
      'track:progress',
      (data: { job_id?: string; index: number; stage: JobStage; percent: number; message: string }) => {
        if (!data.job_id) return
        updateTrack(data.job_id, data.index, {
          stage: data.stage,
          percent: data.percent,
          message: data.message,
        })
      },
    )

    socket.on(
      'track:complete',
      (data: {
        job_id?: string
        index: number
        file_name: string
        artist?: string
        title?: string
      }) => {
        if (!data.job_id) return
        updateTrack(data.job_id, data.index, {
          stage: 'done',
          percent: 99,
          message: 'Saving to device',
          fileName: data.file_name,
          resolvedArtist: data.artist ?? null,
          resolvedTitle: data.title ?? null,
        })
      },
    )

    socket.on('track:error', (data: { job_id?: string; index: number; error: string }) => {
      if (!data.job_id) return
      updateTrack(data.job_id, data.index, {
        stage: 'error',
        error: data.error,
        message: data.error,
      })
    })

    socket.on('job:complete', (data: { job_id?: string; zip_url: string | null }) => {
      if (!data.job_id) return
      updateJob(data.job_id, { status: 'complete', zipUrl: data.zip_url })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [hydrated, setConnected, updateJob, updateTrack])

  useEffect(() => {
    if (!hydrated || !socketRef.current?.connected) return
    runningIds.forEach((jobId) => socketRef.current?.emit('join_job', { job_id: jobId }))
  }, [hydrated, runningKey, runningIds])

  useEffect(() => {
    if (!hydrated || !runningIds.length) return

    const poll = () => {
      const currentJobs = useDownloadQueueStore.getState().jobs
      currentJobs
        .filter((job) => job.status === 'running' || job.status === 'pending')
        .forEach((job) => {
          void getJob(job.id)
            .then((snapshot) => {
              updateJob(job.id, applyJobSnapshot(job, snapshot))
            })
            .catch((error: Error) => {
              const lower = error.message.toLowerCase()
              if (!lower.includes('404') && !lower.includes('not found')) return
              updateJob(job.id, {
                status: 'error',
                tracks: job.tracks.map((track) =>
                  track.stage === 'error'
                    ? track
                    : {
                        ...track,
                        stage: 'error',
                        error: error.message,
                        message: error.message,
                      },
                ),
              })
            })
        })
    }

    poll()
    if (connected) return

    const interval = setInterval(poll, 4000)
    return () => clearInterval(interval)
  }, [connected, hydrated, runningKey, runningIds.length, updateJob])
}
