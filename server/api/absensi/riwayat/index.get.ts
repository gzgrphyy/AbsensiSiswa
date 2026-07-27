export default defineEventHandler(async (event) => {
  const user = (await getUserSession(event)).user!

  const today = new Date(new Date().toISOString().split('T')[0])

  const sesiList = await prisma.sesiAbsensi.findMany({
    where: {
      dibukaOleh: user.id,
      tanggal: { lte: today }
    },
    include: {
      jadwal: {
        select: {
          mapel: true,
          jamMulai: true,
          jamSelesai: true,
          kelas: { select: { id: true, nama: true, _count: { select: { siswa: true } } } },
          ruangan: { select: { id: true, nama: true } }
        }
      },
      requests: {
        select: { status: true }
      },
      _count: { select: { requests: true } }
    },
    orderBy: { tanggal: 'desc' },
    take: 100
  })

  return sesiList.map(s => ({
    id: s.id,
    tanggal: s.tanggal.toISOString().split('T')[0],
    mapel: s.jadwal.mapel,
    kelas: s.jadwal.kelas.nama,
    ruangan: s.jadwal.ruangan.nama,
    status: s.status,
    totalSiswa: s.jadwal.kelas._count.siswa,
    hadir: s.requests.filter(r => r.status === 'HADIR').length,
    sakit: s.requests.filter(r => r.status === 'SAKIT').length,
    izin: s.requests.filter(r => r.status === 'IZIN').length,
    alpha: s.requests.filter(r => r.status === 'ALPHA').length
  }))
})
