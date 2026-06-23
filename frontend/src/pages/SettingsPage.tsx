import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { healthCheck } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { exportLibrary, getSetting, importLibrary, setSetting } from '@/db/libraryRepository'

export function SettingsPage() {
  const [filenameTemplate, setFilenameTemplate] = useState('{artist} - {title}.mp3')
  const [importMessage, setImportMessage] = useState('')

  useQuery({
    queryKey: ['settings', 'filenameTemplate'],
    queryFn: async () => {
      const value = await getSetting('filenameTemplate', '{artist} - {title}.mp3')
      setFilenameTemplate(value)
      return value
    },
  })

  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: healthCheck,
    refetchInterval: 30000,
  })

  const saveTemplate = async () => {
    await setSetting('filenameTemplate', filenameTemplate)
  }

  const handleExport = async () => {
    const json = await exportLibrary()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'tunefetch-library-backup.json'
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
        <p className="mt-1 text-sm text-text-secondary">App preferences and system status.</p>
      </header>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Server Status</h2>
        {healthQuery.data ? (
          <div className="space-y-1 text-xs text-text-secondary">
            <p>API: {healthQuery.data.status}</p>
            <p>FFmpeg: {healthQuery.data.ffmpeg ?? 'Not detected'}</p>
            <p>yt-dlp: {healthQuery.data.ytdlp_version}</p>
            <p>YouTube cookies: {healthQuery.data.youtube_cookies ? 'Configured' : 'Missing (downloads may fail on cloud)'}</p>
          </div>
        ) : (
          <p className="text-xs text-text-secondary">Checking backend…</p>
        )}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Filename Template</h2>
        <input
          value={filenameTemplate}
          onChange={(event) => setFilenameTemplate(event.target.value)}
          className="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm outline-none ring-accent focus:ring-2"
        />
        <Button variant="secondary" onClick={() => void saveTemplate()}>
          Save template
        </Button>
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

      <Card>
        <h2 className="text-sm font-semibold text-text-primary">Samsung Music Tip</h2>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">
          After downloading, open Samsung Music. It scans your Downloads folder for new MP3 files.
          Proper artist, album, and cover art tags help tracks appear correctly in your library.
        </p>
      </Card>
    </div>
  )
}
