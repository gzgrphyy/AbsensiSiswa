import { z } from 'zod'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const bodySchema = z.object({
  tanggal: z.array(z.string().regex(DATE_RE, 'Format tanggal tidak valid')).min(1, 'Pilih minimal satu tanggal').max(14, 'Maksimal 14 tanggal dalam satu pengajuan'),
  jenis: z.enum(['SAKIT', 'IZIN']),
  keterangan: z.string().trim().max(255).optional().or(z.literal('')),
  bukti: z.string().trim().max(255).optional().or(z.literal(''))
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Silakan login terlebih dahulu' })
  }

  const siswa = await prisma.siswa.findUnique({ where: { userId: session.user.id } })
  if (!siswa) {
    throw createError({ statusCode: 404, statusMessage: 'Data murid tidak ditemukan' })
  }

  const result = bodySchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.error.issues[0].message })
  }

  const { tanggal, jenis } = result.data
  const keterangan = result.data.keterangan || null
  const bukti = result.data.bukti || null
  const now = new Date()
  const todayKey = formatDateKey(now)
  const timeNow = now.toTimeString().slice(0, 5)

  function labelTanggal(t: string) {
    return new Date(`${t}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const conflicts: string[] = []
  for (const t of tanggal) {
    const hari = hariFromDateKey(t) as 'SENIN' | 'SELASA' | 'RABU' | 'KAMIS' | 'JUMAT' | 'SABTU' | 'MINGGU'

    const jadwals = await prisma.jadwalPelajaran.findMany({
      where: { kelasId: siswa.kelasId, hari },
      select: { jamSelesai: true }
    })
    if (jadwals.length === 0) {
      throw createError({ statusCode: 400, statusMessage: `Tidak ada jadwal pelajaran pada ${labelTanggal(t)}` })
    }

    if (t <= todayKey) {
      const masihBerjalan = jadwals.some(j => j.jamSelesai >= timeNow)
      if (!masihBerjalan) {
        throw createError({ statusCode: 400, statusMessage: `Sesi kelas pada ${labelTanggal(t)} sudah selesai semua` })
      }
    }

    const existing = await prisma.izin.findUnique({
      where: { siswaId_tanggal: { siswaId: siswa.id, tanggal: new Date(t) } }
    })
    if (existing) conflicts.push(labelTanggal(t))
  }
  if (conflicts.length > 0) {
    throw createError({ statusCode: 400, statusMessage: `Sudah ada pengajuan untuk tanggal: ${conflicts.join(', ')}` })
  }

  const created = await prisma.izin.createMany({
    data: tanggal.map(t => ({
      siswaId: siswa.id,
      tanggal: new Date(t),
      jenis,
      keterangan,
      bukti
    }))
  })

  return { success: true, count: created.count }
})