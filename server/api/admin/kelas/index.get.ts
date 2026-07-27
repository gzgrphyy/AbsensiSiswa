export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const tahunAjaranId = query.tahunAjaranId ? parseInt(query.tahunAjaranId as string) : undefined

  return await prisma.kelas.findMany({
    where: {
      ...(tahunAjaranId && { tahunAjaranId })
    },
    orderBy: { createdAt: 'desc' },
    include: {
      waliKelas: {
        select: { id: true, nama: true, nip: true }
      },
      tahunAjaran: true,
      _count: {
        select: { siswa: true }
      }
    }
  })
})
