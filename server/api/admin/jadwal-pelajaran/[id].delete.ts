export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })

  const existing = await prisma.jadwalPelajaran.findUnique({
    where: { id },
    include: { _count: { select: { sesi: true } } }
  })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Jadwal pelajaran tidak ditemukan' })

  if (existing._count.sesi > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Jadwal "${existing.mapel}" sudah memiliki ${existing._count.sesi} sesi absensi. Hapus sesi terlebih dahulu.`
    })
  }

  await prisma.jadwalPelajaran.delete({ where: { id } })

  return { message: 'Jadwal pelajaran berhasil dihapus' }
})
