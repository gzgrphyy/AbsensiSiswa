export default defineEventHandler(async (event) => {
  const user = (await getUserSession(event)).user!

  const sesiList = await prisma.sesiAbsensi.findMany({
    where: {
      dibukaOleh: user.id,
      status: 'SELESAI'
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

  return sesiList.map(s => {
    const totalSiswa = s.jadwal.kelas._count.siswa
    const hadir = s.requests.filter(r => r.status === 'HADIR').length
    const sakit = s.requests.filter(r => r.status === 'SAKIT').length
    const izin = s.requests.filter(r => r.status === 'IZIN').length
    const alpha = s.requests.filter(r => r.status === 'ALPHA').length
    const totalScan = hadir + sakit + izin + alpha
    const persentase = totalSiswa > 0 ? Number(((hadir / totalSiswa) * 100).toFixed(1)) : 0

    return {
      mapel: s.jadwal.mapel,
      kelas: s.jadwal.kelas.nama,
      totalSiswa,
      hadir,
      sakit,
      izin,
      alpha,
      persentase
    }
  })
})
