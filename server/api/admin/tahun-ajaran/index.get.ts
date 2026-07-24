export default defineEventHandler(async () => {
  return await prisma.tahunAjaran.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { kelas: true } } }
  })
})
