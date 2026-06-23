const UNSAFE_CHARS = /[<>:"/\\|?*\x00-\x1f]/g

function sanitize(value: string): string {
  return value.replace(UNSAFE_CHARS, '').replace(/\s+/g, ' ').trim()
}

export function applyFilenameTemplate(
  template: string,
  fields: { artist: string; title: string; album?: string | null },
): string {
  const artist = sanitize(fields.artist) || 'Unknown Artist'
  const title = sanitize(fields.title) || 'Unknown Title'
  const album = sanitize(fields.album ?? '') || 'Unknown Album'

  let name = template
    .replace(/\{artist\}/gi, artist)
    .replace(/\{title\}/gi, title)
    .replace(/\{album\}/gi, album)

  if (!name.toLowerCase().endsWith('.mp3')) {
    name += '.mp3'
  }

  return sanitize(name) || `${artist} - ${title}.mp3`
}
