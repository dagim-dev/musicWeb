import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { healthCheck } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { exportLibrary, getSetting, importLibrary, setSetting } from '@/db/libraryRepository'
import { useTheme, type ThemeMode } from '@/hooks/useTheme'
import { DGLABS_FOLDER, isNativeApp } from '@/utils/nativeFileSave'
import { openSamsungMusic } from '@/utils/samsungMusic'
import { encodeCookiesFile, isNetscapeCookiesFile, readCookiesFileContent } from '@/utils/youtubeCookies'

const themeOptions: Array<{ value: ThemeMode; label: string }> = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
]

export function SettingsPage() {
  const [importMessage, setImportMessage] = useState('')
  const [youtubeCookies, setYoutubeCookies] = useState('')
  const [cookiesMessage, setCookiesMessage] = useState('')
  const { theme, setTheme } = useTheme()

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

  const saveYoutubeCookies = async () => {
    const value = youtubeCookies.trim()
    await setSetting('youtubeCookiesBase64', value)
    setCookiesMessage(value ? 'YouTube session saved on this device.' : 'YouTube session cleared.')
  }

  const handleCookiesFile = async (file: File) => {
    let text: string
    try {
      text = await readCookiesFileContent(file)
    } catch {
      setCookiesMessage('Could not read that file. Try cookies.txt from the extension (Export, not Print to PDF).')
      return
    }

    if (!isNetscapeCookiesFile(text)) {
      setCookiesMessage(
        'That file does not look like YouTube cookies. Use extension → Export on youtube.com (save as .txt, not PDF).',
      )
      return
    }
    if (!text.trim()) {
      setCookiesMessage('The cookies file is empty.')
      return
    }

    const encoded = await encodeCookiesFile(file)
    setYoutubeCookies(encoded)
    await setSetting('youtubeCookiesBase64', encoded)
    const label = file.name.toLowerCase().endsWith('.pdf') ? 'cookies.pdf' : 'cookies.txt'
    setCookiesMessage(`YouTube session saved from ${label}.`)
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
          If downloads fail with a bot check, export cookies while signed into YouTube — no Terminal
          keychain prompt needed.
        </p>
        <ol className="list-decimal space-y-2 pl-4 text-xs leading-relaxed text-text-secondary">
          <li>
            On a computer: install Chrome extension{' '}
            <strong className="text-text-primary">Get cookies.txt LOCALLY</strong>.
          </li>
          <li>
            Open <strong className="text-text-primary">youtube.com</strong> (signed in) → extension →
            export <strong className="text-text-primary">cookies.txt</strong> (use Export, not Print to PDF).
          </li>
          <li>Transfer the file to this phone (AirDrop, email, Drive).</li>
          <li>Upload below — session stays on this device only.</li>
        </ol>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-primary">Upload cookies file</span>
          <input
            type="file"
            accept=".txt,.pdf,text/plain,application/pdf"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void handleCookiesFile(file)
              event.target.value = ''
            }}
            className="block w-full text-xs text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-2 file:text-xs file:font-medium file:text-white"
          />
        </label>
        {cookiesMessage ? (
          <p
            className={
              cookiesMessage.includes('does not look') ||
              cookiesMessage.includes('empty') ||
              cookiesMessage.includes('Could not read')
                ? 'text-xs text-danger'
                : 'text-xs text-success'
            }
          >
            {cookiesMessage}
          </p>
        ) : null}
        <details className="text-xs text-text-secondary">
          <summary className="cursor-pointer text-text-primary">Advanced: paste base64 manually</summary>
          <p className="mt-2 leading-relaxed">
            Run{' '}
            <code className="rounded bg-surface-muted px-1 py-0.5">
              ./scripts/cookies-file-to-base64.sh cookies.txt
            </code>{' '}
            on your Mac, or see docs/YOUTUBE_COOKIES.md.
          </p>
          <textarea
            value={youtubeCookies}
            onChange={(event) => setYoutubeCookies(event.target.value)}
            placeholder="Paste YOUTUBE_COOKIES_BASE64 value"
            rows={3}
            className="mt-2 w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-xs outline-none ring-accent focus:ring-2"
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => void saveYoutubeCookies()}>
              Save pasted value
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
              Clear session
            </Button>
          </div>
        </details>
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
