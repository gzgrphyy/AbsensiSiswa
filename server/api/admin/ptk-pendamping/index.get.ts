export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = query.search as string | undefined
  const showInactive = query.showInactive === 'true'

  return await prisma.ptkPendamping.findMany({
    where: {
      ...(showInactive ? { isActive: false } : { isActive: true }),
      ...(search && { nama: { contains: search } })
    },
    orderBy: { nama: 'asc' },
    select: {
      id: true,
      nama: true,
      nip: true,
      nomorHp: true,
      keterangan: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { jadwalPelajaran: true } }
    }
  })
})