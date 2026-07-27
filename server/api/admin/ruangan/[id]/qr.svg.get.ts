import { renderSVG } from 'uqr'

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params!.id)
  const ruangan = await prisma.ruangan.findUnique({ where: { id } })
  if (!ruangan) {
    throw createError({ statusCode: 404, statusMessage: 'Ruangan tidak ditemukan' })
  }

  const baseUrl = getRequestProtocol(event) + '://' + getRequestHost(event)
  const scanUrl = `${baseUrl}/siswa/scan?code=${ruangan.qrCode}`

  const svg = renderSVG(scanUrl, {
    pixelSize: 8,
    border: 2,
    blackColor: '#1e293b',
    whiteColor: '#ffffff'
  })

  setResponseHeader(event, 'Content-Type', 'image/svg+xml')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  return svg
})
