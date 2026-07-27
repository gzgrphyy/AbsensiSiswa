export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })

  const existing = await prisma.siswa.findUnique({
    where: { id },
    include: {
      user: { select: { id: true } },
      _count: { select: { absensiRequests: true } }
    }
  })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Siswa tidak ditemukan' })

  if (existing._count.absensiRequests > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Siswa sudah memiliki riwayat absensi dan tidak bisa dihapus'
    })
  }

  await prisma.$transaction(async (tx) => {
    await tx.siswa.delete({ where: { id } })
    if (existing.user) {
      await tx.user.delete({ where: { id: existing.user.id } })
    }
  })

  return { message: 'Siswa beserta akunnya berhasil dihapus' }
})
