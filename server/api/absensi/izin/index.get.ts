export default defineEventHandler(async (event) => {
  const user = (await getUserSession(event)).user!
  if (user.role !== 'GURU') {
    throw createError({ statusCode: 403, statusMessage: 'Akses ditolak' })
  }

  const kelasWali = await prisma.kelas.findMany({
    where: { waliKelasId: user.id },
    select: { id: true, nama: true },
    orderBy: { nama: 'asc' }
  })
  const kelasIds = kelasWali.map(k => k.id)

  const izins = await prisma.izin.findMany({
    where: { siswa: { kelasId: { in: kelasIds } } },
    include: {
      siswa: {
        select: {
          id: true,
          nisn: true,
          nama: true,
          kelas: { select: { id: true, nama: true } }
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

  return {
    kelasWali,
    pendingCount: izins.filter(i => i.status === 'PENDING').length,
    pending: izins.filter(i => i.status === 'PENDING').map(mapItem),
    history: izins.filter(i => i.status !== 'PENDING').map(mapItem)
  }
})