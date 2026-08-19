export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })

  const data = await prisma.semester.findFirst({
    where: { id, deletedAt: null },
    include: { tahunAjaran: true, _count: { select: { kelas: true } } }
  })

  if (!data) throw createError({ statusCode: 404, statusMessage: 'Semester tidak ditemukan' })

  return data
})