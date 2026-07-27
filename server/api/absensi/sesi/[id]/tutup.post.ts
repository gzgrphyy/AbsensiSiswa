export default defineEventHandler(async (event) => {
  const user = (await getUserSession(event)).user!
  const id = parseInt(event.context.params!.id)

  const sesi = await prisma.sesiAbsensi.findUnique({
    where: { id },
    include: {
      jadwal: { include: { kelas: { include: { siswa: true } } } },
      requests: { select: { siswaId: true } }
    }
  })
  if (!sesi) {
    throw createError({ statusCode: 404, statusMessage: 'Sesi tidak ditemukan' })
  }
  if (sesi.dibukaOleh !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Anda tidak membuka sesi ini' })
  }
  if (sesi.status === 'SELESAI') {
    throw createError({ statusCode: 400, statusMessage: 'Sesi sudah ditutup' })
  }

  const scannedIds = new Set(sesi.requests.map(r => r.siswaId))
  const absentSiswa = sesi.jadwal.kelas.siswa.filter(s => !scannedIds.has(s.id))

  const now = new Date()
  const data = absentSiswa.map(s => ({
    sesiId: id,
    siswaId: s.id,
    scannedAt: now,
    status: 'ALPHA' as const,
    approvedBy: user.id,
    approvedAt: now
  }))

  if (data.length > 0) {
    await prisma.absensiRequest.createMany({ data })
  }

  return await prisma.sesiAbsensi.update({
    where: { id },
    data: { status: 'SELESAI' },
    include: {
      jadwal: {
        include: {
          kelas: { select: { id: true, nama: true } },
          ruangan: { select: { id: true, nama: true } }
        }
      },
      _count: { select: { requests: true } }
    }
  })
})
