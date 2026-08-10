export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Silakan login terlebih dahulu' })
  }

  const siswa = await prisma.siswa.findUnique({ where: { userId: session.user.id } })
  if (!siswa) {
    throw createError({ statusCode: 404, statusMessage: 'Data murid tidak ditemukan' })
  }

  const jadwals = await prisma.jadwalPelajaran.findMany({
    where: { kelasId: siswa.kelasId },
    select: { hari: true, jamSelesai: true }
  })

  const byHari = new Map<string, string[]>()
  for (const j of jadwals) {
    const arr = byHari.get(j.hari) || []
    arr.push(j.jamSelesai)
    byHari.set(j.hari, arr)
  }

  const now = new Date()
  const timeNow = now.toTimeString().slice(0, 5)
  const todayKey = formatDateKey(now)

  const dates: { tanggal: string; hari: string }[] = []
  for (let i = 0; i < 14; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)
    const key = formatDateKey(d)
    const hari = hariFromDateKey(key)
    const endings = byHari.get(hari)
    if (!endings || endings.length === 0) continue
    if (key === todayKey) {
      const masihBerjalan = endings.some(e => e >= timeNow)
      if (!masihBerjalan) continue
    }
    dates.push({ tanggal: key, hari })
  }

  const existing = await prisma.izin.findMany({
    where: { siswaId: siswa.id },
    select: { tanggal: true }
  })
  const submitted = existing.map(e => formatDateKey(e.tanggal))

  return { dates, submitted, today: todayKey }
})