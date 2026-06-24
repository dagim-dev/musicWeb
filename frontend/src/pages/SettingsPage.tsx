import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { healthCheck } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { exportLibrary, getSetting, importLibrary, setSetting } from '@/db/libraryRepository'
import { useTheme, type ThemeMode } from '@/hooks/useTheme'
import { DGLABS_FOLDER, isNativeApp } from '@/utils/nativeFileSave'
import { openSamsungMusic } from '@/utils/samsungMusic'

const themeOptions: Array<{ value: ThemeMode; label: string }> = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
]

export function SettingsPage() {
  const [filenameTemplate, setFilenameTemplate] = useState('{artist} - {title}.mp3')
  const [importMessage, setImportMessage] = useState('')
  const [youtubeCookies, setYoutubeCookies] = useState('')
  const [cookiesMessage, setCookiesMessage] = useState('')
  const { theme, setTheme } = useTheme()

  useQuery({
    queryKey: ['settings', 'filenameTemplate'],
    queryFn: async () => {
      const value = await getSetting('filenameTemplate', '{artist} - {title}.mp3')
      setFilenameTemplate(value)
      return value
    },
  })

  useQuery({
    queryKey: ['settings', 'youtubeCookiesBase64'],
    queryFn: async () => {
      const value = await getSetting('youtubeCookiesBase64', '')
      setYoutubeCookies(value)
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

  const saveYoutubeCookies = async () => {
    const value = youtubeCookies.trim()
    await setSetting('youtubeCookiesBase64', value)
    setCookiesMessage(value ? 'YouTube session saved on this device.' : 'YouTube session cleared.')
  }

  const handleCookiesFile = async (file: File) => {
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    const chunkSize = 8192
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize)
      binary += String.fromCharCode(...chunk)
    }
    const encoded = btoa(binary)
    setYoutubeCookies(encoded)
    await setSetting('youtubeCookiesBase64', encoded)
    setCookiesMessage('YouTube cookies imported from file.')
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
            <p>
              YouTube cookies (server):{' '}
              {healthQuery.data.youtube_cookies ? 'Configured' : 'Missing — add below or on Railway'}
            </p>
            <p>
              YouTube cookies (this device):{' '}
              {youtubeCookies.trim() ? 'Configured' : 'Not set'}
            </p>
          </div>
        ) : (
          <p className="text-xs text-text-secondary">Checking backend…</p>
        )}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">YouTube Session</h2>
        <p className="text-xs leading-relaxed text-text-secondary">
          If downloads fail with a bot check, export cookies from a browser where you are signed into
          YouTube. On your Mac run{' '}
          <code className="rounded bg-surface-muted px-1 py-0.5">./scripts/encode-youtube-cookies.sh chrome</code>{' '}
          in Terminal, then paste the base64 string below. Stored only on this device.
        </p>
        <textarea
          value={youtubeCookies}
          onChange={(event) => setYoutubeCookies(event.target.value)}
          placeholder="Paste YOUTUBE_COOKIES_BASE64 value here"
          rows={4}
          className="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-xs outline-none ring-accent focus:ring-2"
        />
        <div className="grid grid-cols-2 gap-2">
          <Button variant="primary" onClick={() => void saveYoutubeCookies()}>
            Save session
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setYoutubeCookies('')
              void setSetting('youtubeCookiesBase64', '').then(() =>
                setCookiesMessage('YouTube session cleared.'),
              )
            }}
          >
            Clear
          </Button>
        </div>
        <label className="block">
          <span className="mb-2 block text-xs text-text-secondary">Or upload cookies.txt (Netscape format)</span>
          <input
            type="file"
            accept=".txt,text/plain"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void handleCookiesFile(file)
            }}
            className="block w-full text-xs text-text-secondary"
          />
        </label>
        {cookiesMessage ? <p className="text-xs text-success">{cookiesMessage}</p> : null}
      </Card>

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
