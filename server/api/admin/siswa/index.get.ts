export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const kelasId = query.kelasId ? parseInt(query.kelasId as string) : undefined
  const search = query.search as string | undefined

  const data = await prisma.siswa.findMany({
    where: {
      ...(kelasId && { kelasId }),
      ...(search && {
        OR: [
          { nama: { contains: search } },
          { nisn: { contains: search } }
        ]
      })
    },
    include: {
      user: { select: { id: true, nama: true, email: true, isActive: true } },
      kelas: { select: { id: true, nama: true } }
    }
  })

  return data.sort((a, b) => a.nama.length - b.nama.length || a.nama.localeCompare(b.nama))
})
