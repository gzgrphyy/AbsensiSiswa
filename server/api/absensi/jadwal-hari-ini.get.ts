export default defineEventHandler(async (event) => {
  const user = (await getUserSession(event)).user!
  const now = new Date()
  const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU']
  const todayHari = days[now.getDay()] as any
  const timeNow = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const jadwals = await prisma.jadwalPelajaran.findMany({
    where: {
      guruId: user.id,
      hari: todayHari,
    },
    orderBy: { jamMulai: 'asc' },
    include: {
      kelas: { select: { id: true, nama: true } },
      ruangan: { select: { id: true, nama: true, qrCode: true } },
      sesi: {
        where: { tanggal: new Date(now.toISOString().split('T')[0]) },
        select: { id: true, status: true }
      }
    }
  })

  return jadwals.map(j => ({
    ...j,
    isWithinTime: j.jamMulai <= timeNow && timeNow <= j.jamSelesai,
    activeSesi: j.sesi.find(s => s.status === 'AKTIF') || null,
    todaySesi: j.sesi[0] || null
  }))
})
