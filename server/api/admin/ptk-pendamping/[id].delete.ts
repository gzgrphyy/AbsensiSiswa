export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })

  const existing = await prisma.ptkPendamping.findUnique({
    where: { id },
    include: { kelas: { select: { nama: true } } }
  })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'PTK pendamping tidak ditemukan' })

  if (existing.kelasId) {
    throw createError({
      statusCode: 400,
      statusMessage: `PTK pendamping "${existing.nama}" masih mendampingi kelas ${existing.kelas?.nama}. Hapus dulu pendampingan kelasnya.`
    })
  }

  await prisma.ptkPendamping.delete({ where: { id } })

  return { message: 'PTK pendamping berhasil dihapus' }
})