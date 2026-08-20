import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DownloadMode, JobStage, TrackEntry } from '@/api/client'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface QueueTrack {
  entry: TrackEntry
  stage: JobStage
  percent: number
  message: string
  fileName: string | null
  error: string | null
  resolvedArtist?: string | null
  resolvedTitle?: string | null
  saveStatus: SaveStatus
  saveError: string | null
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
  connected: boolean
  hydrated: boolean
  addJob: (job: QueueJob) => void
  updateJob: (jobId: string, patch: Partial<QueueJob>) => void
  updateTrack: (jobId: string, index: number, patch: Partial<QueueTrack>) => void
  removeJob: (jobId: string) => void
  reorderJob: (jobId: string, direction: 'up' | 'down') => void
  setConnected: (connected: boolean) => void
  setHydrated: () => void
}

export const useDownloadQueueStore = create<DownloadQueueState>()(
  persist(
    (set) => ({
      jobs: [],
      connected: false,
      hydrated: false,
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
          const current = jobs[index]
          const swap = jobs[target]
          if (!current || !swap) return state
          jobs[index] = swap
          jobs[target] = current
          return { jobs }
        }),
      setConnected: (connected) => set({ connected }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'dglabs-download-queue',
      partialize: (state) => ({ jobs: state.jobs }),
      merge: (persisted, current) => {
        const stored = persisted as { jobs?: QueueJob[] } | undefined
        return {
          ...current,
          jobs: (stored?.jobs ?? []).map((job) => ({
            ...job,
            tracks: job.tracks.map((track) => ({
              ...track,
              saveStatus: track.saveStatus ?? (track.stage === 'done' ? 'saved' : 'idle'),
              saveError: track.saveError ?? null,
            })),
          })),
        }
      },
      onRehydrateStorage: () => () => {
        useDownloadQueueStore.setState({ hydrated: true })
      },
    },
  ),
)

if (typeof window !== 'undefined' && useDownloadQueueStore.persist.hasHydrated()) {
  useDownloadQueueStore.setState({ hydrated: true })
}
