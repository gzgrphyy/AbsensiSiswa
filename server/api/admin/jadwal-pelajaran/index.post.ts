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

  const { kelasId, ruanganId, mapel, guruId, ptkPendampingId, hari, jamMulai, jamSelesai } = result.data

  const [kelas, ruangan, guru, pen] = await Promise.all([
    prisma.kelas.findUnique({ where: { id: kelasId } }),
    prisma.ruangan.findUnique({ where: { id: ruanganId } }),
    prisma.user.findFirst({ where: { id: guruId, role: 'GURU' } }),
    ptkPendampingId ? prisma.ptkPendamping.findUnique({ where: { id: ptkPendampingId } }) : Promise.resolve(null)
  ])
  if (!kelas) throw createError({ statusCode: 404, statusMessage: 'Kelas tidak ditemukan' })
  if (!ruangan) throw createError({ statusCode: 404, statusMessage: 'Ruangan tidak ditemukan' })
  if (!guru) throw createError({ statusCode: 404, statusMessage: 'Guru tidak ditemukan' })
  if (ptkPendampingId && !pen) throw createError({ statusCode: 404, statusMessage: 'PTK pendamping tidak ditemukan' })

  // Aturan: 1 PTK pendamping hanya boleh mendampingi 1 mapel per kelas
  if (ptkPendampingId) {
    const pemakaian = await prisma.jadwalPelajaran.findFirst({
      where: {
        ptkPendampingId,
        OR: [
          { mapel: { not: mapel } },
          { kelasId: { not: kelasId } }
        ]
      },
      include: { kelas: { select: { nama: true } } }
    })
    if (pemakaian) {
      throw createError({
        statusCode: 409,
        statusMessage: `PTK pendamping "${pen!.nama}" sudah mendampingi ${pemakaian.mapel} kelas ${pemakaian.kelas.nama}. Satu pendamping hanya boleh mendampingi 1 mapel per kelas.`
      })
    }
  }

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
      ...(ptkPendampingId ? { ptkPendampingId } : {}),
      hari: hari as any,
      jamMulai,
      jamSelesai
    },
    include: {
      kelas: { select: { id: true, nama: true } },
      ruangan: { select: { id: true, nama: true } },
      guru: { select: { id: true, nama: true, nip: true } },
      ptkPendamping: { select: { id: true, nama: true } }
    }
  })
})
