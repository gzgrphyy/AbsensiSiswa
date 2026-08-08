export default defineEventHandler(async (event) => {
  const user = (await getUserSession(event)).user!

  const hariOrder = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU']

  const jadwals = await prisma.jadwalPelajaran.findMany({
    where: { guruId: user.id },
    orderBy: [{ hari: 'asc' }, { jamMulai: 'asc' }],
    include: {
      kelas: { select: { id: true, nama: true } },
      ruangan: { select: { id: true, nama: true } }
    }
  })

  const grouped: Record<string, typeof jadwals> = {}
  for (const h of hariOrder) {
    const items = jadwals.filter(j => j.hari === h)
    if (items.length > 0) {
      grouped[h] = items
    }
  }

  return { hariOrder, grouped }
})
