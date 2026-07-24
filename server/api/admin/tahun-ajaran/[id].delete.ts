export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })

  const existing = await prisma.tahunAjaran.findFirst({
    where: { id, deletedAt: null },
    include: { _count: { select: { kelas: true } } }
  })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Tahun ajaran tidak ditemukan' })

  if (existing.isActive) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tahun ajaran yang aktif tidak bisa dihapus. Pindahkan status aktif ke tahun ajaran lain terlebih dahulu.'
    })
  }

  await prisma.tahunAjaran.update({
    where: { id },
    data: { deletedAt: new Date() }
  })

  const kelasCount = existing._count.kelas

  return {
    message: kelasCount > 0
      ? `Tahun ajaran berhasil dihapus. ${kelasCount} kelas terkait masih tersimpan di database.`
      : 'Tahun ajaran berhasil dihapus.',
    kelasCount
  }
})
