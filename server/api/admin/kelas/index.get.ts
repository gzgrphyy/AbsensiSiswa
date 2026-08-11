export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const tahunAjaranId = query.tahunAjaranId ? parseInt(query.tahunAjaranId as string) : undefined
  const search = query.search as string | undefined

  return await prisma.kelas.findMany({
    where: {
      ...(tahunAjaranId && { tahunAjaranId }),
      ...(search && {
        OR: [
          { nama: { contains: search } },
          { waliKelas: { nama: { contains: search } } },
          { tahunAjaran: { nama: { contains: search } } }
        ]
      })
    },
    orderBy: { nama: 'desc' },
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
