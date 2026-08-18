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

  const existing = await prisma.izin.findMany({
    where: { siswaId: siswa.id },
    select: { tanggal: true }
  })
  const submittedSet = new Set(existing.map(e => formatDateKey(e.tanggal)))

  type IzinState = 'available' | 'submitted' | 'no_schedule' | 'finished'
  const days: { tanggal: string; hari: string; state: IzinState }[] = []

  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)
    if (i > 0 && d.getDay() === 0) break

    const key = formatDateKey(d)
    const hari = hariFromDateKey(key)
    const endings = byHari.get(hari)

    let state: IzinState
    if (submittedSet.has(key)) {
      state = 'submitted'
    } else if (!endings || endings.length === 0) {
      state = 'no_schedule'
    } else if (key === todayKey && !endings.some(e => e >= timeNow)) {
      state = 'finished'
    } else {
      state = 'available'
    }

    days.push({ tanggal: key, hari, state })
  }

  return { days, today: todayKey }
})
