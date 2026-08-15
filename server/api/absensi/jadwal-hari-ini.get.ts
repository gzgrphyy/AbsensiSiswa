export default defineEventHandler(async (event) => {
  const user = (await getUserSession(event)).user!
  await finalizeExpiredSesi()

  const now = new Date()
  const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU']
  const todayHari = days[now.getDay()] as any
  const timeNow = currentTimeHHMM(now)

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
        where: { tanggal: todayDate() },
        select: { id: true, status: true }
      }
    }
  })

  return jadwals.map(j => ({
    ...j,
    isWithinTime: (() => {
      const t = timeToMinutes(timeNow)
      const start = timeToMinutes(j.jamMulai) - TOLERANSI_MENIT
      const end = timeToMinutes(j.jamSelesai) + TOLERANSI_MENIT
      return t >= start && t <= end
    })(),
    activeSesi: j.sesi.find(s => s.status === 'AKTIF') || null,
    todaySesi: j.sesi[0] || null
  }))
})