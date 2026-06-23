import { useQuery } from '@tanstack/react-query'
import { findDuplicateTracks } from '@/db/libraryRepository'
import type { TrackEntry } from '@/api/client'

export function useDuplicateCheck(entries: TrackEntry[] | null, enabled: boolean) {
  return useQuery({
    queryKey: ['duplicates', entries?.map((e) => e.id).join(',')],
    enabled: enabled && Boolean(entries?.length),
    queryFn: async () => {
      if (!entries?.length) return []
      const ids = entries.map((entry) => entry.id)
      return findDuplicateTracks(ids)
    },
  })
}
