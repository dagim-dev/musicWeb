import { useEffect, useState } from 'react'
import { getSetting, setSetting } from '@/db/libraryRepository'

export type ThemeMode = 'dark' | 'light' | 'system'

const THEME_COLORS: Record<'dark' | 'light', string> = {
  dark: '#050508',
  light: '#f8fafc',
}

function resolveTheme(mode: ThemeMode): 'dark' | 'light' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  }
  return mode
}

export function applyTheme(mode: ThemeMode) {
  const resolved = resolveTheme(mode)
  document.documentElement.dataset.theme = resolved
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[resolved])
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>('dark')

  useEffect(() => {
    void getSetting('theme', 'dark').then((value) => {
      const mode = (value === 'light' || value === 'system' ? value : 'dark') as ThemeMode
      setThemeState(mode)
      applyTheme(mode)
    })
  }, [])

  useEffect(() => {
    if (theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => applyTheme('system')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])

  const setTheme = async (mode: ThemeMode) => {
    setThemeState(mode)
    applyTheme(mode)
    await setSetting('theme', mode)
  }

  return { theme, setTheme, resolved: resolveTheme(theme) }
}
