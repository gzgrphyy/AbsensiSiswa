import { z } from 'zod'

const querySchema = z.object({
  tahunAjaranId: z.coerce.number().int().positive().optional(),
  kelasId: z.coerce.number().int().positive().optional(),
  tanggalMulai: z.string().optional(),
  tanggalAkhir: z.string().optional(),
  status: z.enum(['AKTIF', 'SELESAI']).optional(),
  search: z.string().optional()
})

function parseTanggal(value: string | undefined, endOfDay = false) {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0))
}

export default defineEventHandler(async (event) => {
  const query = querySchema.parse(getQuery(event))

  const mulai = parseTanggal(query.tanggalMulai)
  const akhir = parseTanggal(query.tanggalAkhir, true)

  const filterTanggal = (mulai || akhir)
    ? { ...(mulai && { gte: mulai }), ...(akhir && { lte: akhir }) }
    : undefined

  const jadwalFilter: Record<string, unknown> = {}
  if (query.kelasId) {
    jadwalFilter.kelasId = query.kelasId
  }
  if (query.tahunAjaranId) {
    jadwalFilter.kelas = {
      tahunAjaranId: query.tahunAjaranId
    }
  }
  if (query.search) {
    jadwalFilter.OR = [
      { mapel: { contains: query.search } },
      { kelas: { nama: { contains: query.search } } }
    ]
  }

  const sesi = await prisma.sesiAbsensi.findMany({
    where: {
      ...(filterTanggal && { tanggal: filterTanggal }),
      ...(query.status && { status: query.status as any }),
      ...(Object.keys(jadwalFilter).length > 0 && { jadwal: jadwalFilter })
    },
    orderBy: [{ tanggal: 'desc' }, { jadwal: { jamMulai: 'asc' } }],
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

  return sesi.map(s => {
    const totalSiswa = s.jadwal.kelas._count.siswa
    const hadir = s.requests.filter(r => r.status === 'HADIR').length
    const sakit = s.requests.filter(r => r.status === 'SAKIT').length
    const izin = s.requests.filter(r => r.status === 'IZIN').length
    const alpha = s.requests.filter(r => r.status === 'ALPHA').length
    const pending = s.requests.filter(r => r.status === 'PENDING').length
    const persentase = totalSiswa > 0 ? Number(((hadir / totalSiswa) * 100).toFixed(1)) : 0

    return {
      sesiId: s.id,
      tanggal: s.tanggal.toISOString().split('T')[0],
      hari: s.jadwal.hari,
      mapel: s.jadwal.mapel,
      jamMulai: s.jadwal.jamMulai,
      jamSelesai: s.jadwal.jamSelesai,
      kelasId: s.jadwal.kelasId,
      kelas: s.jadwal.kelas.nama,
      ruangan: s.jadwal.ruangan.nama,
      statusSesi: s.status,
      totalSiswa,
      hadir,
      sakit,
      izin,
      alpha,
      pending,
      persentase
    }
  })
})