export default defineEventHandler(async (event) => {
  const today = todayDate()
  await finalizeExpiredSesi()

  const [ruangan, allTodaySesi] = await Promise.all([
    prisma.ruangan.findMany(),
    prisma.sesiAbsensi.findMany({
      where: { tanggal: today },
      include: {
        jadwal: { select: { ruanganId: true, kelasId: true } },
        requests: { select: { id: true } }
      }
    })
  ])

  const kelasIds = [...new Set(allTodaySesi.map(s => s.jadwal.kelasId))]
  const kelasSiswaCount = kelasIds.length > 0
    ? await prisma.kelas.findMany({
        where: { id: { in: kelasIds } },
        select: { id: true, _count: { select: { siswa: true } } }
      })
    : []

  const kelasCountMap = new Map(kelasSiswaCount.map(k => [k.id, k._count.siswa]))

  const result = ruangan.map((r) => {
    const sesiRuangan = allTodaySesi.filter(s => s.jadwal.ruanganId === r.id)
    const sesiAktif = sesiRuangan.filter(s => s.status === 'AKTIF').length

    const distinctKelasIds = [...new Set(sesiRuangan.map(s => s.jadwal.kelasId))]
    const totalSiswa = distinctKelasIds.reduce((sum, id) => sum + (kelasCountMap.get(id) || 0), 0)

    const sudahAbsen = sesiRuangan.reduce((sum, s) => sum + s.requests.length, 0)
    const belumAbsen = Math.max(0, totalSiswa - sudahAbsen)

    return {
      ruangan: r.nama,
      sesiAktif,
      totalSiswa,
      sudahAbsen,
      belumAbsen,
      status: sesiAktif > 0 ? 'AKTIF' : 'TIDAK AKTIF'
    }
  })

  return result
})
