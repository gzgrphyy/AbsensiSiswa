export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const kelasId = query.kelasId ? parseInt(query.kelasId as string) : undefined
  const search = query.search as string | undefined

  return await prisma.siswa.findMany({
    where: {
      ...(kelasId && { kelasId }),
      ...(search && {
        OR: [
          { nama: { contains: search } },
          { nisn: { contains: search } }
        ]
      })
    },
    orderBy: [{ kelasId: 'asc' }, { nama: 'asc' }],
    include: {
      user: { select: { id: true, nama: true, email: true, isActive: true } },
      kelas: { select: { id: true, nama: true } }
    }
  })
})
