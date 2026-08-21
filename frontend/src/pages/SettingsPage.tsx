import { useState, type ReactNode } from 'react'
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

function SectionHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
        {icon}
      </span>
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
    </div>
  )
}

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
    <div className="min-w-0 space-y-5 pb-6 pt-4">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Settings</h1>
        <p className="mt-2 text-sm text-text-secondary">App preferences and local tools.</p>
      </header>

      <Card className="space-y-4">
        <SectionHeader
          title="Appearance"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
            </svg>
          }
        />
        <p className="text-xs text-text-secondary">Choose dark, light, or match your device setting.</p>
        <div className="flex rounded-xl bg-surface-muted p-1">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => void setTheme(option.value)}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                theme === option.value
                  ? 'gradient-accent text-accent-foreground shadow-md'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <SectionHeader
          title="Library Backup"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
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
            className="block w-full max-w-full text-xs text-text-secondary"
          />
        </label>
        {importMessage ? <p className="text-xs text-success">{importMessage}</p> : null}
      </Card>

      <Card className="space-y-3">
        <SectionHeader
          title="Download folder"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <p className="text-xs leading-relaxed text-text-secondary">
          {isNativeApp()
            ? `The Android app saves MP3 files to Downloads/${DGLABS_FOLDER}/. The folder is created automatically on first download.`
            : `The browser PWA saves to your Downloads folder. Install the Android app (see CAPACITOR.md) to use Downloads/${DGLABS_FOLDER}/ automatically.`}
        </p>
      </Card>

      <Card className="space-y-3">
        <SectionHeader
          title="Samsung Music"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <p className="text-xs leading-relaxed text-text-secondary">
          After downloading, open Samsung Music. It scans your Downloads folder for new MP3 files.
          Proper artist, album, and cover art tags help tracks appear correctly in your library.
        </p>
        <Button variant="secondary" fullWidth onClick={openSamsungMusic}>
          Open Samsung Music
        </Button>
      </Card>
    </div>
  )
}
