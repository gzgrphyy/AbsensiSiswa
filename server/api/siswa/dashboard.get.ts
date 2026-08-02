export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const siswa = await prisma.siswa.findUnique({
    where: { userId: session.user.id },
    include: { kelas: { select: { id: true, nama: true } } }
  })
  if (!siswa) {
    throw createError({ statusCode: 404, statusMessage: 'Data murid tidak ditemukan' })
  }

  const now = new Date()
  const today = new Date(now.toISOString().split('T')[0])
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [todayRequests, monthHadir, monthAlpha, recentHistory, todaySesi] = await Promise.all([
    prisma.absensiRequest.findMany({
      where: { siswaId: siswa.id, sesi: { tanggal: today } },
      include: {
        sesi: {
          include: {
            jadwal: {
              include: {
                ruangan: { select: { id: true, nama: true } },
                kelas: { select: { id: true, nama: true } },
                guru: { select: { id: true, nama: true } }
              }
            }
          }
        }
      },
      orderBy: { scannedAt: 'desc' }
    }),
    prisma.absensiRequest.count({
      where: {
        siswaId: siswa.id,
        status: 'HADIR',
        sesi: { tanggal: { gte: monthStart } }
      }
    }),
    prisma.absensiRequest.count({
      where: {
        siswaId: siswa.id,
        status: 'ALPHA',
        sesi: { tanggal: { gte: monthStart } }
      }
    }),
    prisma.absensiRequest.findMany({
      where: { siswaId: siswa.id },
      include: {
        sesi: {
          include: {
            jadwal: {
              select: {
                mapel: true,
                kelas: { select: { nama: true } }
              }
            }
          }
        }
      },
      orderBy: { scannedAt: 'desc' },
      take: 5
    }),
    prisma.sesiAbsensi.findMany({
      where: { tanggal: today, jadwal: { kelasId: siswa.kelasId } },
      select: { id: true, status: true }
    })
  ])

  let todayStatus: {
    state: 'PRESENT' | 'PENDING' | 'ALPHA' | 'NOT_YET' | 'NO_SESSION'
    status?: string
    scannedAt?: string
    mapel?: string
    kelas?: string
    ruangan?: string
    jamMulai?: string
    jamSelesai?: string
  }

  if (todayRequests.length > 0) {
    const latest = todayRequests[0]
    const status = latest.status
    todayStatus = {
      state: status === 'ALPHA' ? 'ALPHA' : status === 'PENDING' ? 'PENDING' : 'PRESENT',
      status,
      scannedAt: latest.scannedAt.toISOString(),
      mapel: latest.sesi.jadwal.mapel,
      kelas: latest.sesi.jadwal.kelas.nama,
      ruangan: latest.sesi.jadwal.ruangan.nama,
      jamMulai: latest.sesi.jadwal.jamMulai,
      jamSelesai: latest.sesi.jadwal.jamSelesai
    }
  } else {
    todayStatus = {
      state: todaySesi.length === 0 ? 'NO_SESSION' : 'NOT_YET',
      status: undefined
    }
  }

  return {
    siswa: {
      id: siswa.id,
      nama: siswa.nama,
      kelas: siswa.kelas
    },
    todayStatus,
    monthStats: {
      hadir: monthHadir,
      alpha: monthAlpha
    },
    recentHistory: recentHistory.map(h => ({
      id: h.id,
      tanggal: h.sesi.tanggal,
      mapel: h.sesi.jadwal.mapel,
      kelas: h.sesi.jadwal.kelas.nama,
      status: h.status,
      keterangan: h.keterangan,
      scannedAt: h.scannedAt
    }))
  }
})
