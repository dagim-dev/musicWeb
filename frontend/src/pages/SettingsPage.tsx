import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { exportLibrary, importLibrary } from '@/db/libraryRepository'
import { useTheme, type ThemeMode } from '@/hooks/useTheme'
import { DGLABS_FOLDER, isNativeApp } from '@/utils/nativeFileSave'
import { openSamsungMusic } from '@/utils/samsungMusic'

export function SettingsPage() {
  const [importMessage, setImportMessage] = useState('')
  const { theme, setTheme } = useTheme()

  const handleExport = async () => {
    const json = await exportLibrary()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'dglabs-library-backup.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (file: File) => {
    const text = await file.text()
    const count = await importLibrary(text)
    setImportMessage(`Imported ${count} tracks`)
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl space-y-5 p-4 pb-8 lg:p-8">
      <header>
        <p className="text-xs font-semibold tracking-[0.22em] text-accent uppercase">Settings</p>
        <h1 className="mt-1 text-3xl font-extrabold text-text-primary">Preferences</h1>
        <p className="mt-2 text-sm text-text-secondary">Theme, backups, and where files land on this device.</p>
      </header>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Appearance</h2>
        <SegmentedControl
          label="Theme"
          value={theme}
          onChange={(value) => void setTheme(value)}
          options={[
            { value: 'dark' as ThemeMode, label: 'Dark' },
            { value: 'light' as ThemeMode, label: 'Light' },
            { value: 'system' as ThemeMode, label: 'System' },
          ]}
        />
      </Card>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Library backup</h2>
        <Button variant="secondary" fullWidth onClick={() => void handleExport()}>
          Export library JSON
        </Button>
        <label className="block">
          <span className="mb-2 block text-xs text-text-secondary">Import library JSON</span>
          <input
            type="file"
            accept="application/json"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void handleImport(file)
            }}
            className="block w-full text-xs text-text-secondary"
          />
        </label>
        {importMessage ? <p className="text-xs text-success">{importMessage}</p> : null}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Download folder</h2>
        <p className="text-xs leading-relaxed text-text-secondary">
          {isNativeApp()
            ? `The Android app saves MP3 files to Downloads/${DGLABS_FOLDER}/. The folder is created automatically on first download.`
            : `The browser PWA saves to your Downloads folder. Install the Android app to use Downloads/${DGLABS_FOLDER}/ automatically.`}
        </p>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-text-primary">Samsung Music</h2>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">
          After downloading, open Samsung Music. It scans your Downloads folder for new MP3 files.
        </p>
        <Button variant="secondary" fullWidth className="mt-3" onClick={openSamsungMusic}>
          Open Samsung Music
        </Button>
      </Card>
    </div>
  )
}
