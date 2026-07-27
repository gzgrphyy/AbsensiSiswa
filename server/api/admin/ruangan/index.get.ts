export default defineEventHandler(async () => {
  return await prisma.ruangan.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { jadwalPelajaran: true } } }
  })
})
