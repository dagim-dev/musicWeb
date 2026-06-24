export function isNetscapeCookiesFile(content: string): boolean {
  const firstLine = content.split('\n')[0]?.trim() ?? ''
  return firstLine.includes('Netscape HTTP Cookie File') || firstLine.startsWith('# HTTP Cookie File')
}

export async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunkSize = 8192
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}
