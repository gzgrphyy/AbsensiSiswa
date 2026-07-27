export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const siswa = await prisma.siswa.findUnique({ where: { userId: session.user.id } })
  if (!siswa) {
    throw createError({ statusCode: 404, statusMessage: 'Data siswa tidak ditemukan' })
  }

  const today = new Date(new Date().toISOString().split('T')[0])

  const todayRequests = await prisma.absensiRequest.findMany({
    where: {
      siswaId: siswa.id,
      sesi: { tanggal: today }
    },
    include: {
      sesi: {
        include: {
          jadwal: {
            include: {
              ruangan: { select: { id: true, nama: true } },
              kelas: { select: { id: true, nama: true } }
            }
          }
        }
      }
    },
    orderBy: { scannedAt: 'desc' }
  })

  const totalHadir = await prisma.absensiRequest.count({
    where: { siswaId: siswa.id, status: 'HADIR' }
  })
  const totalPending = await prisma.absensiRequest.count({
    where: { siswaId: siswa.id, status: 'PENDING' }
  })
  const totalSakit = await prisma.absensiRequest.count({
    where: { siswaId: siswa.id, status: 'SAKIT' }
  })
  const totalIzin = await prisma.absensiRequest.count({
    where: { siswaId: siswa.id, status: 'IZIN' }
  })
  const totalAlpha = await prisma.absensiRequest.count({
    where: { siswaId: siswa.id, status: 'ALPHA' }
  })

  const recentHistory = await prisma.absensiRequest.findMany({
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
    take: 10
  })

  return {
    today: todayRequests,
    counts: {
      hadir: totalHadir,
      pending: totalPending,
      sakit: totalSakit,
      izin: totalIzin,
      alpha: totalAlpha
    },
    recentHistory: recentHistory.map(h => ({
      id: h.id,
      tanggal: h.sesi.tanggal,
      mapel: h.sesi.jadwal.mapel,
      kelas: h.sesi.jadwal.kelas.nama,
      status: h.status,
      keterangan: h.keterangan,
      scannedAt: h.scannedAt
    })),
    kelas: {
      id: siswa.kelasId,
      nama: (await prisma.kelas.findUnique({ where: { id: siswa.kelasId } }))?.nama
    }
  }
})
