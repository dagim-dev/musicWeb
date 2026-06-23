import { useEffect, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'
import { SOCKET_URL } from '@/api/config'
import type { JobStage } from '@/api/client'
import { useDownloadQueueStore } from '@/stores/downloadQueueStore'

export function useDownloadSocket(jobId: string | null) {
  const socketRef = useRef<Socket | null>(null)
  const updateTrack = useDownloadQueueStore((s) => s.updateTrack)
  const updateJob = useDownloadQueueStore((s) => s.updateJob)

  useEffect(() => {
    if (!jobId) return

    const socket = io(SOCKET_URL || window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('join_job', { job_id: jobId })
    })

    socket.on('job:started', () => {
      updateJob(jobId, { status: 'running' })
    })

    socket.on('track:progress', (data: { index: number; stage: JobStage; percent: number; message: string }) => {
      updateTrack(jobId, data.index, {
        stage: data.stage,
        percent: data.percent,
        message: data.message,
      })
    })

    socket.on(
      'track:complete',
      (data: {
        index: number
        file_name: string
        download_url: string
        artist?: string
        title?: string
      }) => {
        updateTrack(jobId, data.index, {
          stage: 'done',
          percent: 100,
          message: 'Complete',
          fileName: data.file_name,
          resolvedArtist: data.artist ?? null,
          resolvedTitle: data.title ?? null,
        })
      },
    )

    socket.on('track:error', (data: { index: number; error: string }) => {
      updateTrack(jobId, data.index, {
        stage: 'error',
        error: data.error,
        message: data.error,
      })
    })

    socket.on('job:complete', (data: { zip_url: string | null }) => {
      updateJob(jobId, { status: 'complete', zipUrl: data.zip_url })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [jobId, updateJob, updateTrack])
}
