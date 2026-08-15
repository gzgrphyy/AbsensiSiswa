import { z } from 'zod'

const bodySchema = z.object({
  qrCode: z.string().min(1, 'QR Code tidak boleh kosong')
})

export default defineEventHandler(async (event) => {
  const user = (await getUserSession(event)).user!
  if (user.role !== 'GURU') {
    throw createError({ statusCode: 403, statusMessage: 'Hanya PTK yang dapat melakukan scan ini' })
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

  const checkin = await checkinPtkRuangan(user, ruangan.id)

  if (!checkin.success) {
    return {
      success: false,
      message: 'Tidak ada jadwal yang Anda ampu di ruangan ini hari ini.',
      ruangan: { id: ruangan.id, nama: ruangan.nama }
    }
  }

  return {
    success: true,
    alreadyScanned: checkin.alreadyScanned,
    message: checkin.alreadyScanned
      ? 'Kehadiran Anda sudah tercatat di ruangan ini.'
      : `Kehadiran PTK tercatat untuk ${checkin.jumlahSesi} sesi di ruangan ini.`,
    ruangan: { id: ruangan.id, nama: ruangan.nama },
    jadwals: checkin.jadwals
  }
})