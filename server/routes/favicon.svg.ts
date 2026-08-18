import * as path from 'path'
import * as fs from 'fs'
import * as zlib from 'zlib'

// Cari bounding box area non-transparan (kanal alpha) dari PNG.
// Dipakai untuk memangkas padding transparan di sekeliling logo,
// supaya logo mengisi ikon dengan ukuran standar (tidak tampak kecil di tab browser).
function getAlphaBBox(buffer: Buffer): { x: number; y: number; w: number; h: number; imgW: number; imgH: number } | null {
  try {
    if (buffer.length < 33 || buffer.toString('ascii', 1, 4) !== 'PNG') return null

    const imgW = buffer.readUInt32BE(16)
    const imgH = buffer.readUInt32BE(20)
    const colorType = buffer[25]
    const interlace = buffer[28]
    if (interlace !== 0) return null // Adam7 interlaced tidak didukung -> fallback

    // Hanya PNG dengan kanal alpha: RGBA (6) atau gray+alpha (4)
    const bpp = colorType === 6 ? 4 : colorType === 4 ? 2 : 0
    if (!bpp) return null
    const alphaOffset = colorType === 6 ? 3 : 1

    const chunks: Buffer[] = []
    let offset = 8
    let idatLen = 0
    while (offset + 8 <= buffer.length) {
      const len = buffer.readUInt32BE(offset)
      const type = buffer.toString('ascii', offset + 4, offset + 8)
      if (type === 'IDAT') {
        chunks.push(buffer.subarray(offset + 8, offset + 8 + len))
        idatLen += len
      }
      if (type === 'IEND') break
      offset += 12 + len
    }
    if (idatLen === 0) return null

    const raw = zlib.inflateSync(Buffer.concat(chunks))
    const stride = imgW * bpp
    const img = Buffer.alloc(raw.length)
    let prev = Buffer.alloc(stride)

    let minX = imgW
    let minY = imgH
    let maxX = -1
    let maxY = -1

    for (let y = 0; y < imgH; y++) {
      const ft = raw[y * (stride + 1)]
      const row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1))
      const out = img.subarray(y * stride, (y + 1) * stride)
      for (let x = 0; x < stride; x++) {
        const a = x >= bpp ? out[x - bpp] : 0
        const b = prev[x]
        const c = x >= bpp ? prev[x - bpp] : 0
        let val = row[x]
        if (ft === 1) val += a
        else if (ft === 2) val += b
        else if (ft === 3) val += (a + b) >> 1
        else if (ft === 4) val += paeth(a, b, c)
        out[x] = val & 0xFF
      }
      for (let px = 0; px < imgW; px++) {
        if (out[px * bpp + alphaOffset] > 10) {
          if (px < minX) minX = px
          if (px > maxX) maxX = px
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
      prev = out
    }

    if (maxX < 0) return null
    return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1, imgW, imgH }
  } catch {
    return null
  }
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c
}

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

  // Favicon = gambar asli apa adanya: latar transparan dibiarkan transparan
  // (tanpa warna latar tambahan), supaya logo tampil natural seperti favicon standar.

  // Potong padding transparan supaya logo mengisi ikon (ukuran standar, tidak terlalu kecil)
  const bbox = ext === '.png' ? getAlphaBBox(buffer) : null
  const hasMargin = !!bbox && bbox.w / bbox.imgW < 0.97 && bbox.h / bbox.imgH < 0.97

  let viewBox = '0 0 64 64'
  let img = { x: 0, y: 0, w: 64, h: 64 }

  if (hasMargin && bbox) {
    // ViewBox di-set ke area logo (+ padding kecil), lalu di-slice ke kanvas 64x64
    const pad = Math.round(Math.max(bbox.w, bbox.h) * 0.05)
    viewBox = `${bbox.x - pad} ${bbox.y - pad} ${bbox.w + pad * 2} ${bbox.h + pad * 2}`
    img = { x: 0, y: 0, w: bbox.imgW, h: bbox.imgH }
  }

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="64" height="64" viewBox="${viewBox}" preserveAspectRatio="xMidYMid slice">`,
    `<image href="${dataUri}" xlink:href="${dataUri}" x="${img.x}" y="${img.y}" width="${img.w}" height="${img.h}" preserveAspectRatio="xMidYMid slice"/>`,
    '</svg>'
  ].join('')

  setHeader(event, 'Content-Type', 'image/svg+xml')
  setHeader(event, 'Cache-Control', 'public, max-age=86400')
  return svg
})
