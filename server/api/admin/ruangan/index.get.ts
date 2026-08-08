function sortRuangan(a: { jenis: string; nama: string }, b: { jenis: string; nama: string }) {
  // KELAS urutan pertama, sisanya bebas
  if (a.jenis === 'KELAS' && b.jenis !== 'KELAS') return -1
  if (a.jenis !== 'KELAS' && b.jenis === 'KELAS') return 1
  if (a.jenis === 'KELAS' && b.jenis === 'KELAS') {
    // Descending: XII > XI > X
    return b.nama.localeCompare(a.nama)
  }
  return a.jenis.localeCompare(b.jenis) || a.nama.localeCompare(b.nama)
}

export default defineEventHandler(async () => {
  const today = new Date(new Date().toISOString().split('T')[0])

  const [data, sesiAktif] = await Promise.all([
    prisma.ruangan.findMany({
      select: {
        id: true,
        nama: true,
        jenis: true,
        qrCode: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { jadwalPelajaran: true } }
      }
    }),
    prisma.sesiAbsensi.findMany({
      where: {
        status: 'AKTIF',
        tanggal: today
      },
      select: { jadwal: { select: { ruanganId: true } } }
    })
  ])

  const jumlahByRuangan = new Map<number, number>()
  for (const s of sesiAktif) {
    jumlahByRuangan.set(s.jadwal.ruanganId, (jumlahByRuangan.get(s.jadwal.ruanganId) || 0) + 1)
  }

  const result = data.map(r => ({
    ...r,
    sesiAktif: (jumlahByRuangan.get(r.id) || 0) > 0,
    jumlahSesiAktif: jumlahByRuangan.get(r.id) || 0
  }))

  result.sort(sortRuangan)
  result.sort((a, b) => Number(b.sesiAktif) - Number(a.sesiAktif))
  return result
})