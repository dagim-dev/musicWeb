import { create } from 'zustand'
import type { DownloadMode, JobStage, TrackEntry } from '@/api/client'

export interface QueueTrack {
  entry: TrackEntry
  stage: JobStage
  percent: number
  message: string
  fileName: string | null
  error: string | null
  resolvedArtist?: string | null
  resolvedTitle?: string | null
}

export interface QueueJob {
  id: string
  url: string
  title: string
  album: string | null
  mode: DownloadMode
  status: 'pending' | 'running' | 'complete' | 'error' | 'cancelled'
  tracks: QueueTrack[]
  zipUrl: string | null
  createdAt: string
}

interface DownloadQueueState {
  jobs: QueueJob[]
  activeTab: 'home' | 'settings'
  addJob: (job: QueueJob) => void
  updateJob: (jobId: string, patch: Partial<QueueJob>) => void
  updateTrack: (
    jobId: string,
    index: number,
    patch: Partial<QueueTrack>,
  ) => void
  removeJob: (jobId: string) => void
  reorderJob: (jobId: string, direction: 'up' | 'down') => void
  setActiveTab: (tab: 'home' | 'settings') => void
}

export const useDownloadQueueStore = create<DownloadQueueState>((set) => ({
  jobs: [],
  activeTab: 'home',
  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
  updateJob: (jobId, patch) =>
    set((state) => ({
      jobs: state.jobs.map((job) => (job.id === jobId ? { ...job, ...patch } : job)),
    })),
  updateTrack: (jobId, index, patch) =>
    set((state) => ({
      jobs: state.jobs.map((job) => {
        if (job.id !== jobId) return job
        const tracks = job.tracks.map((track, i) =>
          i === index ? { ...track, ...patch } : track,
        )
        return { ...job, tracks }
      }),
    })),
  removeJob: (jobId) =>
    set((state) => ({
      jobs: state.jobs.filter((job) => job.id !== jobId),
    })),
  reorderJob: (jobId, direction) =>
    set((state) => {
      const index = state.jobs.findIndex((job) => job.id === jobId)
      if (index < 0) return state
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= state.jobs.length) return state
      const jobs = [...state.jobs]
      ;[jobs[index], jobs[target]] = [jobs[target], jobs[index]]
      return { jobs }
    }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
