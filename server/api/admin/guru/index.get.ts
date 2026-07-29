export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const showInactive = query.showInactive === 'true'
  const search = query.search as string | undefined

  return await prisma.user.findMany({
    where: {
      role: 'GURU',
      ...(!showInactive && { isActive: true }),
      ...(search && { nama: { contains: search } })
    },
    orderBy: [
      { isActive: 'desc' },
      { createdAt: 'desc' }
    ],
    select: {
      id: true,
      nama: true,
      email: true,
      nip: true,
      nomorHp1: true,
      nomorHp2: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          kelasWali: true
        }
      }
    }
  })
})
