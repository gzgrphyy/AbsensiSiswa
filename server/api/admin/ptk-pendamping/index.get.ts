export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = query.search as string | undefined
  const showInactive = query.showInactive === 'true'

  const data = await prisma.ptkPendamping.findMany({
    where: {
      ...(showInactive ? { isActive: false } : { isActive: true }),
      ...(search && { nama: { contains: search } })
    },
    select: {
      id: true,
      nama: true,
      nip: true,
      nomorHp: true,
      jenisKelamin: true,
      keterangan: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return data.sort((a, b) => a.nama.length - b.nama.length || a.nama.localeCompare(b.nama))
})