import { z } from 'zod'

const bodySchema = z.object({
  jadwalId: z.number({ required_error: 'jadwalId wajib diisi' }).int().positive()
})

export default defineEventHandler(async (event) => {
  const user = (await getUserSession(event)).user!
  const result = bodySchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.error.issues[0].message })
  }

  const { jadwalId } = result.data

  const jadwal = await prisma.jadwalPelajaran.findUnique({
    where: { id: jadwalId },
    include: {
      sesi: { where: { tanggal: new Date(new Date().toISOString().split('T')[0]) } }
    }
  })
  if (!jadwal) {
    throw createError({ statusCode: 404, statusMessage: 'Jadwal tidak ditemukan' })
  }
  if (jadwal.guruId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Anda tidak mengampu jadwal ini' })
  }
  if (jadwal.sesi.length > 0) {
    throw createError({ statusCode: 400, statusMessage: 'Sesi untuk jadwal ini hari ini sudah ada' })
  }

  const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU']
  const todayHari = days[new Date().getDay()]
  if (jadwal.hari !== todayHari) {
    throw createError({ statusCode: 400, statusMessage: 'Jadwal ini bukan untuk hari ini' })
  }

  return await prisma.sesiAbsensi.create({
    data: {
      jadwalId,
      tanggal: new Date(new Date().toISOString().split('T')[0]),
      status: 'AKTIF',
      dibukaOleh: user.id
    },
    include: {
      jadwal: {
        include: {
          kelas: { select: { id: true, nama: true } },
          ruangan: { select: { id: true, nama: true } }
        }
      }
    }
  })
})
