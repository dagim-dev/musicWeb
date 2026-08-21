import { BottomNav } from '@/components/layout/BottomNav'
import { HomePage } from '@/pages/HomePage'
import { LibraryPage } from '@/pages/LibraryPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { useDownloadQueueStore } from '@/stores/downloadQueueStore'

function App() {
  const activeTab = useDownloadQueueStore((s) => s.activeTab)
  const setActiveTab = useDownloadQueueStore((s) => s.setActiveTab)

  return (
    <div className="app-shell gradient-mesh">
      <main className="flex-1 overflow-y-auto overflow-x-clip">
        {activeTab === 'home' ? <HomePage /> : null}
        {activeTab === 'library' ? <LibraryPage /> : null}
        {activeTab === 'settings' ? <SettingsPage /> : null}
      </main>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}

export default App
