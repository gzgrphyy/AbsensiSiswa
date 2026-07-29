export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const siswa = await prisma.siswa.findUnique({ where: { userId: session.user.id } })
  if (!siswa) {
    throw createError({ statusCode: 404, statusMessage: 'Data murid tidak ditemukan' })
  }

  const hariOrder = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU']

  const jadwals = await prisma.jadwalPelajaran.findMany({
    where: { kelasId: siswa.kelasId },
    orderBy: [{ hari: 'asc' }, { jamMulai: 'asc' }],
    include: {
      ruangan: { select: { id: true, nama: true } },
      guru: { select: { id: true, nama: true } }
    }
  })

  const grouped: Record<string, typeof jadwals> = {}
  for (const h of hariOrder) {
    const items = jadwals.filter(j => j.hari === h)
    if (items.length > 0) {
      grouped[h] = items
    }
  }

  return {
    kelas: { id: siswa.kelasId, nama: (await prisma.kelas.findUnique({ where: { id: siswa.kelasId } }))?.nama },
    hariOrder,
    grouped
  }
})
