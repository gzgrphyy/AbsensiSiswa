export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const kelasId = query.kelasId ? parseInt(query.kelasId as string) : undefined
  const hari = query.hari as string | undefined
  const guruId = query.guruId ? parseInt(query.guruId as string) : undefined

  return await prisma.jadwalPelajaran.findMany({
    where: {
      ...(kelasId && { kelasId }),
      ...(hari && { hari: hari as any }),
      ...(guruId && { guruId })
    },
    orderBy: [{ hari: 'asc' }, { jamMulai: 'asc' }],
    include: {
      kelas: { select: { id: true, nama: true } },
      ruangan: { select: { id: true, nama: true } },
      guru: { select: { id: true, nama: true, nip: true } }
    }
  })
})
