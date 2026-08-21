import { BackgroundNotes } from '@/components/layout/BackgroundNotes'
import { BottomNav } from '@/components/layout/BottomNav'
import { QueueEffects } from '@/components/queue/QueueEffects'
import { HomePage } from '@/pages/HomePage'
import { QueuePage } from '@/pages/QueuePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { useDownloadQueueStore } from '@/stores/downloadQueueStore'

function App() {
  const activeTab = useDownloadQueueStore((s) => s.activeTab)
  const setActiveTab = useDownloadQueueStore((s) => s.setActiveTab)

  return (
    <div className="app-shell gradient-mesh">
      <BackgroundNotes />
      <QueueEffects />
      <main className="flex-1 overflow-y-auto overflow-x-clip">
        {activeTab === 'home' ? <HomePage /> : null}
        {activeTab === 'queue' ? <QueuePage /> : null}
        {activeTab === 'settings' ? <SettingsPage /> : null}
      </main>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}

export default App
