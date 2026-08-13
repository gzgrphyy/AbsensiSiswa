export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })

  const existing = await prisma.ptkPendamping.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'PTK pendamping tidak ditemukan' })

  const updated = await prisma.ptkPendamping.update({
    where: { id },
    data: { isActive: !existing.isActive },
    select: {
      id: true,
      nama: true,
      isActive: true,
      updatedAt: true
    }
  })

  return {
    ...updated,
    message: updated.isActive
      ? 'PTK pendamping berhasil diaktifkan'
      : 'PTK pendamping berhasil dinonaktifkan'
  }
})