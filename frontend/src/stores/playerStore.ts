import { create } from 'zustand'

interface PlayerState {
  currentTrackId: string | null
  queue: string[]
  isPlaying: boolean
  position: number
  duration: number
  expanded: boolean
  error: string | null
  setCurrent: (trackId: string | null, queue?: string[]) => void
  setPlaying: (isPlaying: boolean) => void
  setProgress: (position: number, duration: number) => void
  setExpanded: (expanded: boolean) => void
  setError: (error: string | null) => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrackId: null,
  queue: [],
  isPlaying: false,
  position: 0,
  duration: 0,
  expanded: false,
  error: null,
  setCurrent: (trackId, queue) =>
    set((state) => ({
      currentTrackId: trackId,
      queue: queue ?? state.queue,
      error: null,
      position: 0,
    })),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setProgress: (position, duration) => set({ position, duration }),
  setExpanded: (expanded) => set({ expanded }),
  setError: (error) => set((state) => ({ error, isPlaying: error ? false : state.isPlaying })),
}))
