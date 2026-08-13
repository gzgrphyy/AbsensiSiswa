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

  const grouped = await prisma.absensiRequest.groupBy({
    by: ['siswaId'],
    where: {
      status: 'ALPHA',
      sesi: {
        tanggal: filterTanggal,
        ...sesiFilter
      }
    },
    _count: { status: true },
    orderBy: { _count: { status: 'desc' } }
  })

  if (grouped.length === 0) return []

  const siswa = await prisma.siswa.findMany({
    where: { id: { in: grouped.map(g => g.siswaId) } },
    select: { id: true, nama: true, kelas: { select: { nama: true } } }
  })

  const siswaMap = new Map(siswa.map(s => [s.id, s]))

  const result = grouped.map(g => ({
    id: g.siswaId,
    nama: siswaMap.get(g.siswaId)?.nama || '-',
    kelas: siswaMap.get(g.siswaId)?.kelas?.nama || '-',
    totalAlpha: g._count.status
  }))

  return result.sort((a, b) => a.nama.length - b.nama.length || a.nama.localeCompare(b.nama))
})
