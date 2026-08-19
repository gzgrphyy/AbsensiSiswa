export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const tahunAjaranId = query.tahunAjaranId ? parseInt(String(query.tahunAjaranId)) : undefined

  return await prisma.semester.findMany({
    where: {
      deletedAt: null,
      ...(tahunAjaranId && { tahunAjaranId })
    },
    orderBy: [{ tahunAjaran: { createdAt: 'desc' } }, { nama: 'asc' }],
    include: {
      tahunAjaran: true,
      _count: { select: { kelas: true } }
    }
  })
})