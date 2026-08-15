import { createJadwalSchema } from './schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = createJadwalSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0].message
    })
  }

  const { kelasId, ruanganId, mapel, guruId, hari, jamMulai, jamSelesai } = result.data

  const [kelas, ruangan, guru] = await Promise.all([
    prisma.kelas.findUnique({ where: { id: kelasId } }),
    prisma.ruangan.findUnique({ where: { id: ruanganId } }),
    prisma.user.findFirst({ where: { id: guruId, role: 'GURU' } })
  ])
  if (!kelas) throw createError({ statusCode: 404, statusMessage: 'Kelas tidak ditemukan' })
  if (!ruangan) throw createError({ statusCode: 404, statusMessage: 'Ruangan tidak ditemukan' })
  if (!guru) throw createError({ statusCode: 404, statusMessage: 'Guru tidak ditemukan' })

  const bentrok = await prisma.jadwalPelajaran.findMany({
    where: {
      hari: hari as any,
      OR: [{ kelasId }, { ruanganId }, { guruId }]
    }
  })

  const overlap = bentrok.filter(
    j => jamMulai < j.jamSelesai && jamSelesai > j.jamMulai
  )

  if (overlap.length > 0) {
    const c = overlap[0]
    const parts: string[] = []
    if (c.kelasId === kelasId) parts.push(`kelas sudah ada jadwal "${c.mapel}" ${c.jamMulai}-${c.jamSelesai}`)
    if (c.ruanganId === ruanganId) parts.push(`ruangan sudah dipakai "${c.mapel}" ${c.jamMulai}-${c.jamSelesai}`)
    if (c.guruId === guruId) parts.push(`guru sudah mengajar "${c.mapel}" ${c.jamMulai}-${c.jamSelesai}`)
    throw createError({ statusCode: 409, statusMessage: 'Jadwal bentrok: ' + parts.join('; ') })
  }

  return await prisma.jadwalPelajaran.create({
    data: {
      kelasId,
      ruanganId,
      mapel,
      guruId,
      hari: hari as any,
      jamMulai,
      jamSelesai
    },
    include: {
      kelas: { select: { id: true, nama: true } },
      ruangan: { select: { id: true, nama: true } },
      guru: { select: { id: true, nama: true, nip: true } }
    }
  })
})
