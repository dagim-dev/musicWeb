import { Outlet } from 'react-router-dom'
import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { Toast } from '@/components/ui/Toast'
import { MiniPlayer } from '@/features/player/MiniPlayer'
import { NowPlayingSheet } from '@/features/player/NowPlayingSheet'
import { useAudioPlayer } from '@/features/player/useAudioPlayer'
import { useQueueSync } from '@/features/queue/useQueueSync'
import { useAutoSave } from '@/features/queue/useAutoSave'
import { useTheme } from '@/hooks/useTheme'
import { usePlayerStore } from '@/stores/playerStore'
import { useToastStore } from '@/stores/toastStore'

export function AppShell() {
  useTheme()
  useQueueSync()
  useAutoSave()
  useAudioPlayer()

  const hasPlayer = usePlayerStore((s) => Boolean(s.currentTrackId))
  const toast = useToastStore()

  return (
    <div
      className="app-shell"
      style={{
        ['--dock-offset' as string]: hasPlayer
          ? 'calc(10.25rem + env(safe-area-inset-bottom))'
          : 'calc(5.75rem + env(safe-area-inset-bottom))',
      }}
    >
      <Sidebar />
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <main
          className={
            hasPlayer
              ? 'min-w-0 w-full flex-1 overflow-y-auto pb-[calc(10.25rem+env(safe-area-inset-bottom))] md:pb-28'
              : 'min-w-0 w-full flex-1 overflow-y-auto pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-8'
          }
        >
          <Outlet />
        </main>
        <MiniPlayer />
        <BottomNav />
      </div>
      <NowPlayingSheet />
      <Toast
        message={toast.message}
        visible={toast.visible}
        variant={toast.variant}
        action={toast.action}
        onClose={toast.hide}
      />
    </div>
  )
}
