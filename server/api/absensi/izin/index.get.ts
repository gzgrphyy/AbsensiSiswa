export default defineEventHandler(async (event) => {
  const user = (await getUserSession(event)).user!
  if (user.role !== 'GURU') {
    throw createError({ statusCode: 403, statusMessage: 'Akses ditolak' })
  }

  const kelas = await prisma.kelas.findMany({
    where: {
      OR: [
        { waliKelasId: user.id },
        { jadwalPelajaran: { some: { guruId: user.id } } }
      ]
    },
    select: { id: true, nama: true, waliKelasId: true },
    orderBy: { nama: 'asc' }
  })
  const kelasIds = kelas.map(k => k.id)
  const isWaliKelas = kelas.some(k => k.waliKelasId === user.id)

  const izins = await prisma.izin.findMany({
    where: { siswa: { kelasId: { in: kelasIds } } },
    include: {
      siswa: {
        select: {
          id: true,
          nisn: true,
          nama: true,
          kelas: { select: { id: true, nama: true, waliKelasId: true } }
        }
      },
      penanggap: { select: { id: true, nama: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const mapItem = (i: (typeof izins)[number]) => ({
    id: i.id,
    tanggal: i.tanggal,
    jenis: i.jenis,
    keterangan: i.keterangan,
    bukti: i.bukti,
    status: i.status,
    createdAt: i.createdAt,
    diresponPada: i.diresponPada,
    siswa: { id: i.siswa.id, nisn: i.siswa.nisn, nama: i.siswa.nama },
    kelas: i.siswa.kelas.nama,
    penanggap: i.penanggap?.nama ?? null
  })

  const pending = izins.filter(
    i => i.status === 'PENDING' && i.siswa.kelas.waliKelasId === user.id
  )

  return {
    isWaliKelas,
    pendingCount: pending.length,
    pending: pending.map(mapItem),
    history: izins.filter(i => i.status !== 'PENDING').map(mapItem)
  }
})