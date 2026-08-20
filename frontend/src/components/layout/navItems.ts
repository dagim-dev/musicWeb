import { House, Library, ListMusic, Settings } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: House },
  { to: '/queue', label: 'Queue', icon: ListMusic },
  { to: '/library', label: 'Library', icon: Library },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const
