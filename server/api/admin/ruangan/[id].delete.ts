export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })

  const existing = await prisma.ruangan.findUnique({
    where: { id },
    include: { _count: { select: { jadwalPelajaran: true } } }
  })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Ruangan tidak ditemukan' })

  if (existing._count.jadwalPelajaran > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Ruangan "${existing.nama}" masih memiliki ${existing._count.jadwalPelajaran} jadwal pelajaran. Hapus jadwal terlebih dahulu.`
    })
  }

  await prisma.ruangan.delete({ where: { id } })

  return { message: 'Ruangan berhasil dihapus' }
})
