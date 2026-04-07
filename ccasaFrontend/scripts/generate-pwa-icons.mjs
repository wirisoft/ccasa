/**
 * Genera iconos PWA desde SVG (matraz alineado con @core/svg/Logo.tsx).
 * Ejecutar: node scripts/generate-pwa-icons.mjs
 * Requiere: npm i -D sharp
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.join(__dirname, '..', 'public', 'icons')

const BRAND = '#1565C0'

/** SVG del matraz (viewBox 0 0 24 24), currentColor = marca */
function flaskSvg(fillBg, strokeColor) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="512" height="512">
  <rect width="24" height="24" fill="${fillBg}"/>
  <g fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 3H15M10 3V8.4C10 8.68 9.86 8.94 9.63 9.11L4.37 12.89C4.14 13.06 4 13.32 4 13.6V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V13.6C20 13.32 19.86 13.06 19.63 12.89L14.37 9.11C14.14 8.94 14 8.68 14 8.4V3"/>
    <path d="M8 15H16"/>
    <circle cx="10" cy="18" r="1" fill="${strokeColor}" stroke="none"/>
    <circle cx="14" cy="17" r="0.75" fill="${strokeColor}" stroke="none"/>
  </g>
</svg>`
}

async function main() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const sizes = [192, 512]

  for (const size of sizes) {
    const regularSvg = Buffer.from(flaskSvg('#FFFFFF', BRAND))
    await sharp(regularSvg).resize(size, size).png().toFile(path.join(outputDir, `icon-${size}x${size}.png`))
    console.log(`✓ icon-${size}x${size}.png`)

    const maskSvg = Buffer.from(flaskSvg(BRAND, '#FFFFFF'))
    await sharp(maskSvg).resize(size, size).png().toFile(path.join(outputDir, `icon-maskable-${size}x${size}.png`))
    console.log(`✓ icon-maskable-${size}x${size}.png`)
  }

  console.log('\nIconos generados en public/icons/')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
