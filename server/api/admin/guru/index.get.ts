export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const showInactive = query.showInactive === 'true'

  return await prisma.user.findMany({
    where: {
      role: 'GURU',
      ...(!showInactive && { isActive: true })
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
