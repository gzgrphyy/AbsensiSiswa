export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Silakan login terlebih dahulu' })
  }

  const siswa = await prisma.siswa.findUnique({ where: { userId: session.user.id } })
  if (!siswa) {
    throw createError({ statusCode: 404, statusMessage: 'Data murid tidak ditemukan' })
  }

  const list = await prisma.izin.findMany({
    where: { siswaId: siswa.id },
    include: { penanggap: { select: { id: true, nama: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  return list.map(i => ({
    id: i.id,
    tanggal: i.tanggal.toISOString().split('T')[0],
    jenis: i.jenis,
    keterangan: i.keterangan,
    bukti: i.bukti,
    status: i.status,
    diresponPada: i.diresponPada,
    penanggap: i.penanggap?.nama ?? null,
    createdAt: i.createdAt
  }))
})