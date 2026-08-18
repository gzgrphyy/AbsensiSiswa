export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Silakan login terlebih dahulu' })
  }

  const siswa = await prisma.siswa.findUnique({ where: { userId: session.user.id } })
  if (!siswa) {
    throw createError({ statusCode: 404, statusMessage: 'Data murid tidak ditemukan' })
  }

  const { tanggal } = getQuery(event)
  if (typeof tanggal !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
    throw createError({ statusCode: 400, statusMessage: 'Format tanggal tidak valid' })
  }

  const hari = hariFromDateKey(tanggal) as 'SENIN' | 'SELASA' | 'RABU' | 'KAMIS' | 'JUMAT' | 'SABTU' | 'MINGGU'

  const jadwals = await prisma.jadwalPelajaran.findMany({
    where: { kelasId: siswa.kelasId, hari },
    select: { jamSelesai: true }
  })

  if (jadwals.length === 0) {
    return { available: false, reason: 'Tidak ada jadwal' }
  }

  const now = new Date()
  const todayKey = formatDateKey(now)
  const timeNow = now.toTimeString().slice(0, 5)

  if (tanggal <= todayKey) {
    const masihBerjalan = jadwals.some(j => j.jamSelesai >= timeNow)
    if (!masihBerjalan) {
      return { available: false, reason: 'Sesi hari ini sudah selesai semua' }
    }
  }

  const existing = await prisma.izin.findUnique({
    where: { siswaId_tanggal: { siswaId: siswa.id, tanggal: new Date(tanggal) } }
  })
  if (existing) {
    return { available: false, reason: 'Sudah diajukan' }
  }

  return { available: true, reason: null }
})
