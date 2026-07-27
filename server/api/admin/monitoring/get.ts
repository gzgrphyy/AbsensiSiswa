export default defineEventHandler(async (event) => {
  const user = (await getUserSession(event)).user!

  const today = new Date(new Date().toISOString().split('T')[0])

  const ruangan = await prisma.ruangan.findMany()

  const result = await Promise.all(ruangan.map(async (r) => {
    const sesiAktif = await prisma.sesiAbsensi.count({
      where: {
        status: 'AKTIF',
        tanggal: today,
        jadwal: {
          ruanganId: r.id
        }
      }
    })

    const jadwalIds = await prisma.jadwalPelajaran.findMany({
      where: { ruanganId: r.id },
      select: { id: true }
    })
    const jadwalIdList = jadwalIds.map(j => j.id)

    let totalSiswaRuangan = 0
    if (jadwalIdList.length > 0) {
      const jadwals = await prisma.jadwalPelajaran.findMany({
        where: { id: { in: jadwalIdList } },
        select: {
          kelas: {
            select: {
              _count: { select: { siswa: true } }
            }
          }
        }
      })
      totalSiswaRuangan = jadwals.reduce((sum, j) => sum + j.kelas._count.siswa, 0)
    }

    const sudahAbsen = await prisma.absensiRequest.count({
      where: {
        sesi: {
          tanggal: today,
          status: 'AKTIF',
          jadwal: {
            ruanganId: r.id
          }
        }
      }
    })

    const belumAbsen = Math.max(0, totalSiswaRuangan - sudahAbsen)

    return {
      ruangan: r.nama,
      sesiAktif,
      totalSiswa: totalSiswaRuangan,
      sudahAbsen,
      belumAbsen,
      status: sesiAktif > 0 ? 'AKTIF' : 'TIDAK AKTIF'
    }
  }))

  return result
})
