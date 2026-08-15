import { z } from 'zod'

const bodySchema = z.object({
  qrCode: z.string().min(1, 'QR Code tidak boleh kosong')
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Silakan login terlebih dahulu' })
  }

  const user = session.user
  const siswa = await prisma.siswa.findUnique({ where: { userId: user.id } })
  if (!siswa) {
    throw createError({ statusCode: 404, statusMessage: 'Data murid tidak ditemukan' })
  }

  const result = bodySchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.error.issues[0].message })
  }

  const { qrCode } = result.data

  const ruangan = await prisma.ruangan.findUnique({ where: { qrCode } })
  if (!ruangan) {
    throw createError({ statusCode: 404, statusMessage: 'QR Code tidak valid' })
  }

  const checkin = await checkinSiswaRuangan(siswa, ruangan.id)

  if (!checkin.success) {
    const message = checkin.reason === 'ALL_DONE'
      ? 'Sesi di ruangan ini hari ini sudah selesai.'
      : 'Tidak ada jadwal kelasmu di ruangan ini hari ini.'
    return {
      success: false,
      message,
      ruangan: { id: ruangan.id, nama: ruangan.nama }
    }
  }

  const scannedAt = new Date()
  return {
    success: true,
    alreadyScanned: checkin.alreadyScanned,
    message: checkin.alreadyScanned
      ? 'Kamu sudah absen di ruangan ini hari ini.'
      : `Absensi tercatat untuk ${checkin.jumlahSesi} sesi pelajaran di ruangan ini hari ini. Menunggu konfirmasi guru.`,
    status: 'PENDING',
    scannedAt: scannedAt.toISOString(),
    ruangan: { id: ruangan.id, nama: ruangan.nama },
    sesi: checkin.info
      ? {
          mapel: checkin.info.mapel,
          kelas: checkin.info.kelas,
          jamMulai: checkin.info.jamMulai,
          jamSelesai: checkin.info.jamSelesai,
          guru: checkin.info.guru
        }
      : null
  }
})