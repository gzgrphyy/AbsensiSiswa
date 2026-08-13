export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })

  const existing = await prisma.ptkPendamping.findUnique({
    where: { id },
    include: { _count: { select: { jadwalPelajaran: true } } }
  })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'PTK pendamping tidak ditemukan' })

  if (existing._count.jadwalPelajaran > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `PTK pendamping "${existing.nama}" masih digunakan di ${existing._count.jadwalPelajaran} jadwal pelajaran. Hapus jadwal terlebih dahulu.`
    })
  }

  await prisma.ptkPendamping.delete({ where: { id } })

  return { message: 'PTK pendamping berhasil dihapus' }
})