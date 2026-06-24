import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')
const iconsDir = path.join(publicDir, 'icons')
const svgPath = path.join(publicDir, 'favicon.svg')

async function renderPng(size, outputName, padding = 0) {
  const svg = await readFile(svgPath)
  const inner = Math.max(1, size - padding * 2)
  const png = await sharp(svg).resize(inner, inner).png().toBuffer()
  const canvas = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 15, g: 15, b: 18, alpha: 1 },
    },
  })

  const outPath = path.join(iconsDir, outputName)
  await canvas
    .composite([{ input: png, gravity: 'centre' }])
    .png()
    .toFile(outPath)
}

await mkdir(iconsDir, { recursive: true })
await renderPng(192, 'icon-192.png')
await renderPng(512, 'icon-512.png')
await renderPng(512, 'icon-512-maskable.png', 102)

const faviconIco = await sharp(path.join(iconsDir, 'icon-192.png'))
  .resize(32, 32)
  .png()
  .toBuffer()
await writeFile(path.join(publicDir, 'favicon.ico'), faviconIco)

console.log('Generated PWA icons in public/icons/ and favicon.ico')
