import { z } from 'zod'

const querySchema = z.object({
  bulan: z.string().optional().default(new Date().toISOString().slice(0, 7))
})

export default defineEventHandler(async (event) => {
  const query = querySchema.parse(getQuery(event))

  const [year, month] = query.bulan.split('-').map(Number)
  const startDate = new Date(Date.UTC(year, month - 1, 1))
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

  const sesi = await prisma.sesiAbsensi.findMany({
    where: {
      tanggal: { gte: startDate, lte: endDate },
      status: 'SELESAI'
    },
    include: {
      jadwal: {
        include: {
          kelas: {
            include: {
              _count: { select: { siswa: true } }
            }
          },
          ruangan: { select: { nama: true } }
        }
      },
      requests: {
        select: { status: true }
      }
    }
  })

  // Group by kelas and aggregate
  const kelasMap = new Map<string, {
    kelas: string
    totalSiswa: number
    hadir: number
    sakit: number
    izin: number
    alpha: number
    totalSesi: number
  }>()

  for (const s of sesi) {
    const key = s.jadwal.kelas.nama
    if (!kelasMap.has(key)) {
      kelasMap.set(key, {
        kelas: key,
        totalSiswa: s.jadwal.kelas._count.siswa,
        hadir: 0,
        sakit: 0,
        izin: 0,
        alpha: 0,
        totalSesi: 0
      })
    }
    const entry = kelasMap.get(key)!
    entry.totalSesi++
    entry.hadir += s.requests.filter(r => r.status === 'HADIR').length
    entry.sakit += s.requests.filter(r => r.status === 'SAKIT').length
    entry.izin += s.requests.filter(r => r.status === 'IZIN').length
    entry.alpha += s.requests.filter(r => r.status === 'ALPHA').length
  }

  const result = Array.from(kelasMap.values()).map(k => {
    const totalScan = k.hadir + k.sakit + k.izin + k.alpha
    const persentase = k.totalSiswa > 0
      ? Number(((k.hadir / k.totalSiswa) * 100).toFixed(1))
      : 0

    return {
      kelas: k.kelas,
      totalSiswa: k.totalSiswa,
      hadir: k.hadir,
      sakit: k.sakit,
      izin: k.izin,
      alpha: k.alpha,
      persentase
    }
  })

  return result
})
