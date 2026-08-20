import { LayoutGrid, List } from 'lucide-react'
import { IconButton } from '@/components/ui/IconButton'

export type LibraryView = 'grid' | 'list'
export type LibrarySort = 'date' | 'artist' | 'album'

interface LibraryToolbarProps {
  query: string
  sortBy: LibrarySort
  view: LibraryView
  onQueryChange: (value: string) => void
  onSortChange: (value: LibrarySort) => void
  onViewChange: (value: LibraryView) => void
}

export function LibraryToolbar({
  query,
  sortBy,
  view,
  onQueryChange,
  onSortChange,
  onViewChange,
}: LibraryToolbarProps) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search title, artist, album"
        className="min-w-0 flex-1 rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm outline-none ring-accent focus:ring-2"
      />
      <select
        value={sortBy}
        onChange={(event) => onSortChange(event.target.value as LibrarySort)}
        className="min-w-0 rounded-xl border border-border bg-surface-muted px-3 py-3 text-sm text-text-primary"
        aria-label="Sort library"
      >
        <option value="date">Date</option>
        <option value="artist">Artist</option>
        <option value="album">Album</option>
      </select>
      <div className="flex rounded-xl bg-surface-muted p-1">
        <IconButton
          label="Grid view"
          size="sm"
          variant={view === 'grid' ? 'accent' : 'plain'}
          onClick={() => onViewChange('grid')}
        >
          <LayoutGrid className="h-4 w-4" />
        </IconButton>
        <IconButton
          label="List view"
          size="sm"
          variant={view === 'list' ? 'accent' : 'plain'}
          onClick={() => onViewChange('list')}
        >
          <List className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  )
}
