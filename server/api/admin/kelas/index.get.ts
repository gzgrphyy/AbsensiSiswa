export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const semesterId = query.semesterId ? parseInt(query.semesterId as string) : undefined
  const search = query.search as string | undefined

  return await prisma.kelas.findMany({
    where: {
      ...(semesterId && { semesterId }),
      ...(search && {
        OR: [
          { nama: { contains: search } },
          { waliKelas: { nama: { contains: search } } },
          { semester: { tahunAjaran: { nama: { contains: search } } } }
        ]
      })
    },
    orderBy: { nama: 'desc' },
    include: {
      waliKelas: {
        select: { id: true, nama: true, nip: true, jenisKelamin: true, foto: true }
      },
      semester: {
        include: { tahunAjaran: true }
      },
      _count: {
        select: { siswa: true }
      }
    }
  })
})