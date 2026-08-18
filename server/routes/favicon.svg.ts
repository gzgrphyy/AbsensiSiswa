import * as path from 'path'
import * as fs from 'fs'

export default defineEventHandler(async (event) => {
  const branding = await prisma.pengaturan.findFirst()
  const faviconPath = branding?.faviconPath

  if (!faviconPath) {
    throw createError({ statusCode: 404, statusMessage: 'Favicon tidak ditemukan' })
  }

  const ext = path.extname(faviconPath).toLowerCase()

  // ICO sudah fixed-size & tidak bisa dibungkus SVG — arahkan ke file aslinya
  if (ext === '.ico') {
    return sendRedirect(event, faviconPath)
  }

  const filePath = path.join(path.resolve('public'), faviconPath.replace(/^\/+/, ''))
  if (!fs.existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: 'File favicon tidak ditemukan' })
  }

  const buffer = fs.readFileSync(filePath)
  const mime = ext === '.svg' ? 'image/svg+xml' : (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg' : 'image/png'
  const dataUri = `data:${mime};base64,${buffer.toString('base64')}`

  // Gaya Telegram: kotak rounded berwarna brand sebagai latar, logo di atasnya.
  // Supaya favicon transparan tidak tampak abu-abu (warna tab browser tembus),
  // dan ikon tampil penuh/tegas di tab.
  const brandColor = branding?.warnaUtama || '#0A66A0'

  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">',
    `<rect x="2" y="2" width="60" height="60" rx="14" fill="${brandColor}"/>`,
    `<image href="${dataUri}" width="64" height="64" preserveAspectRatio="xMidYMid slice"/>`,
    '</svg>'
  ].join('')

  setHeader(event, 'Content-Type', 'image/svg+xml')
  setHeader(event, 'Cache-Control', 'public, max-age=86400')
  return svg
})
