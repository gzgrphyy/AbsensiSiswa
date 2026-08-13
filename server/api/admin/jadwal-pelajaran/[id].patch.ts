import { updateJadwalSchema } from './schema'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })

  const body = await readBody(event)
  const result = updateJadwalSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0].message
    })
  }

  const existing = await prisma.jadwalPelajaran.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Jadwal pelajaran tidak ditemukan' })

  const { kelasId, ruanganId, mapel, guruId, ptkPendampingId, hari, jamMulai, jamSelesai } = result.data

  if (kelasId) {
    const k = await prisma.kelas.findUnique({ where: { id: kelasId } })
    if (!k) throw createError({ statusCode: 404, statusMessage: 'Kelas tidak ditemukan' })
  }
  if (ruanganId) {
    const r = await prisma.ruangan.findUnique({ where: { id: ruanganId } })
    if (!r) throw createError({ statusCode: 404, statusMessage: 'Ruangan tidak ditemukan' })
  }
  if (guruId) {
    const g = await prisma.user.findFirst({ where: { id: guruId, role: 'GURU' } })
    if (!g) throw createError({ statusCode: 404, statusMessage: 'Guru tidak ditemukan' })
  }
  if (ptkPendampingId) {
    const p = await prisma.ptkPendamping.findUnique({ where: { id: ptkPendampingId } })
    if (!p) throw createError({ statusCode: 404, statusMessage: 'PTK pendamping tidak ditemukan' })
  }

  const finalHari = hari ?? existing.hari
  const finalJamMulai = jamMulai ?? existing.jamMulai
  const finalJamSelesai = jamSelesai ?? existing.jamSelesai
  const finalKelasId = kelasId ?? existing.kelasId
  const finalRuanganId = ruanganId ?? existing.ruanganId
  const finalGuruId = guruId ?? existing.guruId
  const finalMapel = mapel ?? existing.mapel
  const finalPtkPendampingId = ptkPendampingId !== undefined ? ptkPendampingId : existing.ptkPendampingId

  // Aturan: 1 PTK pendamping hanya boleh mendampingi 1 mapel per kelas
  if (finalPtkPendampingId) {
    const pen = await prisma.ptkPendamping.findUnique({ where: { id: finalPtkPendampingId } })
    if (!pen) throw createError({ statusCode: 404, statusMessage: 'PTK pendamping tidak ditemukan' })

    const pemakaian = await prisma.jadwalPelajaran.findFirst({
      where: {
        ptkPendampingId: finalPtkPendampingId,
        id: { not: id },
        OR: [
          { mapel: { not: finalMapel } },
          { kelasId: { not: finalKelasId } }
        ]
      },
      include: { kelas: { select: { nama: true } } }
    })
    if (pemakaian) {
      throw createError({
        statusCode: 409,
        statusMessage: `PTK pendamping "${pen.nama}" sudah mendampingi ${pemakaian.mapel} kelas ${pemakaian.kelas.nama}. Satu pendamping hanya boleh mendampingi 1 mapel per kelas.`
      })
    }
  }

  const bentrok = await prisma.jadwalPelajaran.findMany({
    where: {
      id: { not: id },
      hari: finalHari as any,
      OR: [
        { kelasId: finalKelasId },
        { ruanganId: finalRuanganId },
        { guruId: finalGuruId }
      ]
    }
  })

  const overlap = bentrok.filter(j => finalJamMulai < j.jamSelesai && finalJamSelesai > j.jamMulai)

  if (overlap.length > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Jadwal bentrok dengan jadwal lain di hari dan jam yang sama'
    })
  }

  return await prisma.jadwalPelajaran.update({
    where: { id },
    data: {
      ...(kelasId !== undefined && { kelasId }),
      ...(ruanganId !== undefined && { ruanganId }),
      ...(mapel !== undefined && { mapel }),
      ...(guruId !== undefined && { guruId }),
      ...(ptkPendampingId !== undefined && { ptkPendampingId }),
      ...(hari !== undefined && { hari: hari as any }),
      ...(jamMulai !== undefined && { jamMulai }),
      ...(jamSelesai !== undefined && { jamSelesai })
    },
    include: {
      kelas: { select: { id: true, nama: true } },
      ruangan: { select: { id: true, nama: true } },
      guru: { select: { id: true, nama: true, nip: true } },
      ptkPendamping: { select: { id: true, nama: true } }
    }
  })
})
