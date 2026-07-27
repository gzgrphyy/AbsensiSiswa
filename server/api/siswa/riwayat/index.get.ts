export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const siswa = await prisma.siswa.findUnique({ where: { userId: session.user.id } })
  if (!siswa) {
    throw createError({ statusCode: 404, statusMessage: 'Data siswa tidak ditemukan' })
  }

  const requests = await prisma.absensiRequest.findMany({
    where: { siswaId: siswa.id },
    include: {
      sesi: {
        include: {
          jadwal: {
            select: {
              mapel: true,
              kelas: { select: { nama: true } },
              guru: { select: { nama: true } }
            }
          }
        }
      }
    },
    orderBy: { scannedAt: 'desc' },
    take: 100
  })

  return requests.map(r => ({
    id: r.id,
    tanggal: r.sesi.tanggal,
    mapel: r.sesi.jadwal.mapel,
    kelas: r.sesi.jadwal.kelas.nama,
    status: r.status,
    keterangan: r.keterangan,
    scannedAt: r.scannedAt,
    guru: r.sesi.jadwal.guru.nama
  }))
})
