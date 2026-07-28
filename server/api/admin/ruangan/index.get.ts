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
  const data = await prisma.ruangan.findMany({
    include: { _count: { select: { jadwalPelajaran: true } } }
  })
  data.sort(sortRuangan)
  return data
})
