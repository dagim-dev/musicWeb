import { BottomNav } from '@/components/layout/BottomNav'
import { HomePage } from '@/pages/HomePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { useDownloadQueueStore } from '@/stores/downloadQueueStore'

function App() {
  const activeTab = useDownloadQueueStore((s) => s.activeTab)
  const setActiveTab = useDownloadQueueStore((s) => s.setActiveTab)

  return (
    <div className="app-shell">
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'home' ? <HomePage /> : null}
        {activeTab === 'settings' ? <SettingsPage /> : null}
      </main>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}

export default App
