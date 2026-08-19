export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })

  const existing = await prisma.semester.findFirst({
    where: { id, deletedAt: null },
    include: { _count: { select: { kelas: true } } }
  })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Semester tidak ditemukan' })

  if (existing.isActive) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Semester yang aktif tidak bisa dihapus. Pindahkan status aktif ke semester lain terlebih dahulu.'
    })
  }

  if (existing._count.kelas > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Semester yang masih memiliki kelas tidak bisa dihapus.'
    })
  }

  await prisma.semester.update({
    where: { id },
    data: { deletedAt: new Date() }
  })

  return { message: 'Semester berhasil dihapus.', kelasCount: existing._count.kelas }
})