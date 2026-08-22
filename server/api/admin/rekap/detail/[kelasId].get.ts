import { z } from 'zod'

const querySchema = z.object({
  bulan: z.string().optional(),
  semesterId: z.coerce.number().int().positive().optional(),
  tanggal: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const kelasId = parseInt(getRouterParam(event, 'kelasId')!)
  if (isNaN(kelasId)) {
    throw createError({ statusCode: 400, statusMessage: 'ID Kelas tidak valid' })
  }

  const query = querySchema.parse(getQuery(event))

  const kelas = await prisma.kelas.findUnique({
    where: { id: kelasId },
    include: {
      waliKelas: {
        select: { id: true, nama: true, nip: true, jenisKelamin: true, foto: true }
      },
      semester: {
        include: { tahunAjaran: true }
      },
      siswa: {
        include: {
          user: {
            select: { id: true, nama: true, email: true, isActive: true, foto: true, jenisKelamin: true }
          }
        },
        orderBy: { nama: 'asc' }
      }
    }
  })

  if (!kelas) {
    throw createError({ statusCode: 404, statusMessage: 'Kelas tidak ditemukan' })
  }

  const filterTanggal = query.bulan
    ? (() => {
        const [year, month] = query.bulan!.split('-').map(Number)
        return {
          gte: new Date(Date.UTC(year, month - 1, 1)),
          lte: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
        }
      })()
    : undefined

  const jadwalFilter: Record<string, unknown> = {
    kelasId
  }
  if (query.semesterId) {
    jadwalFilter.kelas = {
      semesterId: query.semesterId
    }
  }

  // Fetch all sesi for this kelas
  const sesiList = await prisma.sesiAbsensi.findMany({
    where: {
      ...(filterTanggal && { tanggal: filterTanggal }),
      ...(query.tanggal && { tanggal: query.tanggal }),
      jadwal: jadwalFilter
    },
    orderBy: [{ tanggal: 'desc' }, { jadwal: { jamMulai: 'asc' } }],
    include: {
      jadwal: {
        include: {
          ruangan: { select: { nama: true } },
          guru: { select: { id: true, nama: true } }
        }
      },
      requests: {
        select: {
          id: true,
          siswaId: true,
          status: true,
          scannedAt: true,
          keterangan: true
        }
      }
    }
  })

  // Ambil daftar unique mata pelajaran yang pernah ada sesi di kelas ini
  const mapelSet = new Set<string>()
  const mapelSesiCount = new Map<string, number>()

  for (const s of sesiList) {
    const mapel = s.jadwal.mapel
    mapelSet.add(mapel)
    mapelSesiCount.set(mapel, (mapelSesiCount.get(mapel) || 0) + 1)
  }
  const daftarMapel = Array.from(mapelSet).sort()

  // Aggregate stats per siswa in this class
  const siswaMap = new Map<number, {
    siswaId: number
    nama: string
    nisn: string
    foto: string | null
    hadir: number
    sakit: number
    izin: number
    alpha: number
    pending: number
    totalSesi: number
    persentase: number
    pelajaran: Record<string, {
      hadir: number
      sakit: number
      izin: number
      alpha: number
      pending: number
      totalSesi: number
      persentase: number
    }>
  }>()

  // Initialize for all active students in the class
  for (const s of kelas.siswa) {
    const pelajaranInit: Record<string, {
      hadir: number
      sakit: number
      izin: number
      alpha: number
      pending: number
      totalSesi: number
      persentase: number
    }> = {}

    for (const m of daftarMapel) {
      pelajaranInit[m] = {
        hadir: 0,
        sakit: 0,
        izin: 0,
        alpha: 0,
        pending: 0,
        totalSesi: mapelSesiCount.get(m) || 0,
        persentase: 0
      }
    }

    siswaMap.set(s.id, {
      siswaId: s.id,
      nama: s.nama,
      nisn: s.nisn,
      foto: s.user?.foto || null,
      hadir: 0,
      sakit: 0,
      izin: 0,
      alpha: 0,
      pending: 0,
      totalSesi: sesiList.length,
      persentase: 0,
      pelajaran: pelajaranInit
    })
  }

  for (const sesi of sesiList) {
    const mapel = sesi.jadwal.mapel
    for (const req of sesi.requests) {
      if (siswaMap.has(req.siswaId)) {
        const item = siswaMap.get(req.siswaId)!
        const pel = item.pelajaran[mapel]

        if (req.status === 'HADIR') {
          item.hadir++
          if (pel) pel.hadir++
        } else if (req.status === 'SAKIT') {
          item.sakit++
          if (pel) pel.sakit++
        } else if (req.status === 'IZIN') {
          item.izin++
          if (pel) pel.izin++
        } else if (req.status === 'ALPHA') {
          item.alpha++
          if (pel) pel.alpha++
        } else if (req.status === 'PENDING') {
          item.pending++
          if (pel) pel.pending++
        }
      }
    }
  }

  const listSiswa = Array.from(siswaMap.values()).map(s => {
    const persentase = s.totalSesi > 0
      ? Number(((s.hadir / s.totalSesi) * 100).toFixed(1))
      : 0

    // Hitung persentase per mapel
    for (const m of daftarMapel) {
      const pel = s.pelajaran[m]
      if (pel) {
        pel.persentase = pel.totalSesi > 0
          ? Number(((pel.hadir / pel.totalSesi) * 100).toFixed(1))
          : 0
      }
    }

    return {
      ...s,
      persentase
    }
  })

  // Format list sesi
  const listSesi = sesiList.map(sesi => {
    const hadir = sesi.requests.filter(r => r.status === 'HADIR').length
    const sakit = sesi.requests.filter(r => r.status === 'SAKIT').length
    const izin = sesi.requests.filter(r => r.status === 'IZIN').length
    const alpha = sesi.requests.filter(r => r.status === 'ALPHA').length
    const pending = sesi.requests.filter(r => r.status === 'PENDING').length
    const totalSiswa = kelas.siswa.length
    const persentase = totalSiswa > 0 ? Number(((hadir / totalSiswa) * 100).toFixed(1)) : 0

    return {
      id: sesi.id,
      tanggal: sesi.tanggal.toISOString().split('T')[0],
      hari: sesi.jadwal.hari,
      mapel: sesi.jadwal.mapel,
      jamMulai: sesi.jadwal.jamMulai,
      jamSelesai: sesi.jadwal.jamSelesai,
      ruangan: sesi.jadwal.ruangan.nama,
      guru: sesi.jadwal.guru.nama,
      status: sesi.status,
      totalSiswa,
      hadir,
      sakit,
      izin,
      alpha,
      pending,
      persentase
    }
  })

  // Summary counts
  const totalHadir = listSiswa.reduce((acc, curr) => acc + curr.hadir, 0)
  const totalSakit = listSiswa.reduce((acc, curr) => acc + curr.sakit, 0)
  const totalIzin = listSiswa.reduce((acc, curr) => acc + curr.izin, 0)
  const totalAlpha = listSiswa.reduce((acc, curr) => acc + curr.alpha, 0)
  const totalPending = listSiswa.reduce((acc, curr) => acc + curr.pending, 0)
  const totalSesi = sesiList.length

  return {
    kelas: {
      id: kelas.id,
      nama: kelas.nama,
      waliKelas: kelas.waliKelas,
      semester: kelas.semester,
      totalMurid: kelas.siswa.length
    },
    summary: {
      totalSesi,
      totalHadir,
      totalSakit,
      totalIzin,
      totalAlpha,
      totalPending
    },
    daftarMapel,
    siswa: listSiswa,
    sesi: listSesi
  }
})
