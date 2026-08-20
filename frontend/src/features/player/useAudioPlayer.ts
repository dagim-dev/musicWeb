import { useEffect } from 'react'
import { getTrack } from '@/db/libraryRepository'
import { resolvePlaybackUrl } from '@/features/player/playbackAdapter'
import { usePlayerStore } from '@/stores/playerStore'

let audio: HTMLAudioElement | null = null
let loadedTrackId: string | null = null

function getAudio() {
  if (!audio) {
    audio = new Audio()
    audio.preload = 'metadata'
    audio.addEventListener('timeupdate', () => {
      usePlayerStore.getState().setProgress(audio?.currentTime ?? 0, audio?.duration || 0)
    })
    audio.addEventListener('loadedmetadata', () => {
      usePlayerStore.getState().setProgress(audio?.currentTime ?? 0, audio?.duration || 0)
    })
    audio.addEventListener('ended', () => {
      const state = usePlayerStore.getState()
      const index = state.queue.indexOf(state.currentTrackId ?? '')
      const nextId = index >= 0 ? state.queue[index + 1] : undefined
      if (nextId) {
        state.setCurrent(nextId)
        state.setPlaying(true)
      } else {
        state.setPlaying(false)
      }
    })
    audio.addEventListener('error', () => {
      usePlayerStore.getState().setError('Could not play this file.')
    })
  }
  return audio
}

export async function loadAndPlay(trackId: string, play: boolean) {
  const element = getAudio()
  if (loadedTrackId !== trackId) {
    const track = await getTrack(trackId)
    if (!track) throw new Error('Track not found')
    const url = await resolvePlaybackUrl(track)
    element.src = url
    loadedTrackId = trackId
  }
  if (play) await element.play()
  else element.pause()
}

export function seekTo(seconds: number) {
  const element = getAudio()
  element.currentTime = seconds
}

export function skipBy(delta: number) {
  const state = usePlayerStore.getState()
  const index = state.queue.indexOf(state.currentTrackId ?? '')
  if (index < 0) return
  const nextId = state.queue[index + delta]
  if (!nextId) return
  state.setCurrent(nextId)
  state.setPlaying(true)
}

export function useAudioPlayer() {
  const currentTrackId = usePlayerStore((s) => s.currentTrackId)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const setError = usePlayerStore((s) => s.setError)
  const setPlaying = usePlayerStore((s) => s.setPlaying)

  useEffect(() => {
    getAudio()
  }, [])

  useEffect(() => {
    if (!currentTrackId) {
      getAudio().pause()
      return
    }
    void loadAndPlay(currentTrackId, isPlaying).catch((error: unknown) => {
      setError(error instanceof Error ? error.message : 'Playback unavailable')
      setPlaying(false)
    })
  }, [currentTrackId, isPlaying, setError, setPlaying])
}
