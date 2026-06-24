import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

export function isNetscapeCookiesFile(content: string): boolean {
  if (content.includes('Netscape HTTP Cookie File') || content.includes('# HTTP Cookie File')) {
    return true
  }

  return /\.youtube\.com/i.test(content) && (content.includes('\t') || /\.youtube\.com\s+\S+/m.test(content))
}

export function textToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  const chunkSize = 8192
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
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

function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

  const buffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buffer }).promise
  const pages: string[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join('\n')
    pages.push(pageText)
  }

  return pages.join('\n')
}

export async function readCookiesFileContent(file: File): Promise<string> {
  if (isPdfFile(file)) {
    return extractTextFromPdf(file)
  }
  return file.text()
}

export async function encodeCookiesFile(file: File): Promise<string> {
  const content = await readCookiesFileContent(file)
  return textToBase64(content)
}
