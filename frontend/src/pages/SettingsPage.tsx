import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { exportLibrary, importLibrary } from '@/db/libraryRepository'
import { useTheme, type ThemeMode } from '@/hooks/useTheme'
import { DGLABS_FOLDER, isNativeApp } from '@/utils/nativeFileSave'
import { openSamsungMusic } from '@/utils/samsungMusic'

const themeOptions: Array<{ value: ThemeMode; label: string }> = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
]

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
    <div className="space-y-5 p-4 pb-6">
      <header>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">App preferences and local tools.</p>
      </header>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Appearance</h2>
        <p className="text-xs text-text-secondary">Choose dark, light, or match your device setting.</p>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((option) => (
            <Button
              key={option.value}
              variant={theme === option.value ? 'primary' : 'secondary'}
              onClick={() => void setTheme(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Library Backup</h2>
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
            : `The browser PWA saves to your Downloads folder. Install the Android app (see CAPACITOR.md) to use Downloads/${DGLABS_FOLDER}/ automatically.`}
        </p>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-text-primary">Samsung Music</h2>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">
          After downloading, open Samsung Music. It scans your Downloads folder for new MP3 files.
          Proper artist, album, and cover art tags help tracks appear correctly in your library.
        </p>
        <Button variant="secondary" fullWidth className="mt-3" onClick={openSamsungMusic}>
          Open Samsung Music
        </Button>
      </Card>
    </div>
  )
}
