import { z } from 'zod'

const querySchema = z.object({
  bulan: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  kelasId: z.coerce.number().int().positive().optional()
})

export default defineEventHandler(async (event) => {
  const query = querySchema.parse(getQuery(event))

  const now = new Date()
  const year = query.bulan ? Number(query.bulan.split('-')[0]) : now.getFullYear()
  const month = query.bulan ? Number(query.bulan.split('-')[1]) : now.getMonth() + 1

  const filterTanggal = {
    gte: new Date(Date.UTC(year, month - 1, 1)),
    lte: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
  }

  const sesiFilter: Record<string, unknown> = {}
  if (query.kelasId) {
    sesiFilter.jadwal = { kelasId: query.kelasId }
  }

  const requests = await prisma.absensiRequest.findMany({
    where: {
      status: 'ALPHA',
      sesi: {
        tanggal: filterTanggal,
        ...sesiFilter
      }
    },
    select: {
      siswaId: true,
      sesi: {
        select: {
          tanggal: true,
          jadwal: { select: { mapel: true } }
        }
      }
    }
  })

  if (requests.length === 0) return []

  // Agregasi per murid: mapel apa saja yang alpha + jumlah + tanggal
  const agg = new Map<number, Map<string, { total: number; tanggal: string[] }>>()
  for (const r of requests) {
    const mapel = r.sesi.jadwal.mapel
    const perSiswa = agg.get(r.siswaId) ?? new Map<string, { total: number; tanggal: string[] }>()
    const entry = perSiswa.get(mapel) ?? { total: 0, tanggal: [] as string[] }
    entry.total += 1
    entry.tanggal.push(r.sesi.tanggal.toISOString().slice(0, 10))
    perSiswa.set(mapel, entry)
    agg.set(r.siswaId, perSiswa)
  }

  const siswa = await prisma.siswa.findMany({
    where: { id: { in: [...agg.keys()] } },
    select: { id: true, nama: true, kelas: { select: { nama: true } } }
  })

  const siswaMap = new Map(siswa.map(s => [s.id, s]))

  const result = [...agg.entries()].map(([siswaId, mapelMap]) => ({
    id: siswaId,
    nama: siswaMap.get(siswaId)?.nama || '-',
    kelas: siswaMap.get(siswaId)?.kelas?.nama || '-',
    totalAlpha: [...mapelMap.values()].reduce((sum, v) => sum + v.total, 0),
    pelajaran: [...mapelMap.entries()]
      .map(([mapel, v]) => ({ mapel, total: v.total, tanggal: v.tanggal.sort() }))
      .sort((a, b) => b.total - a.total || a.mapel.localeCompare(b.mapel))
  }))

  return result.sort((a, b) => b.totalAlpha - a.totalAlpha || a.nama.localeCompare(b.nama))
})
