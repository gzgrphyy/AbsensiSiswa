export default defineEventHandler(async (event) => {
  const type = event.context.params!.type
  const user = (await getUserSession(event)).user!

  switch (type) {
    case 'rekap-saya': {
      const sesiList = await prisma.sesiAbsensi.findMany({
        where: {
          dibukaOleh: user.id,
          status: 'SELESAI'
        },
        include: {
          jadwal: {
            include: {
              kelas: { select: { nama: true } },
              ruangan: { select: { nama: true } }
            }
          },
          requests: {
            include: {
              siswa: { select: { nisn: true, nama: true } }
            },
            orderBy: { siswa: { nama: 'asc' } }
          }
        },
        orderBy: { tanggal: 'desc' },
        take: 50
      })

      const rows: string[] = ['Tanggal,Kelas,Mata Pelajaran,Ruangan,NISN,Nama Siswa,Status']
      for (const sesi of sesiList) {
        for (const req of sesi.requests) {
          rows.push([
            sesi.tanggal.toISOString().split('T')[0],
            `"${sesi.jadwal.kelas.nama}"`,
            `"${sesi.jadwal.mapel}"`,
            `"${sesi.jadwal.ruangan.nama}"`,
            req.siswa.nisn,
            `"${req.siswa.nama}"`,
            req.status
          ].join(','))
        }
      }

      setResponseHeader(event, 'Content-Type', 'text/csv')
      setResponseHeader(event, 'Content-Disposition', `attachment; filename=rekap-guru-${user.id}-${new Date().toISOString().split('T')[0]}.csv`)
      return rows.join('\n')
    }

    case 'rekap-kelas': {
      // Get all kelas the guru teaches via jadwal
      const kelasIds = await prisma.jadwalPelajaran.findMany({
        where: { guruId: user.id },
        select: { kelasId: true },
        distinct: ['kelasId']
      })

      const ids = kelasIds.map(k => k.kelasId)

      if (ids.length === 0) {
        setResponseHeader(event, 'Content-Type', 'text/csv')
        setResponseHeader(event, 'Content-Disposition', 'attachment; filename=rekap-kelas.csv')
        return 'Kelas,Guru,Total Siswa,Mata Pelajaran\n"Tidak ada data","-",0,"-"'
      }

      const jadwal = await prisma.jadwalPelajaran.findMany({
        where: { guruId: user.id },
        include: {
          kelas: {
            include: {
              _count: { select: { siswa: true } }
            }
          },
          sesi: {
            where: {
              status: 'SELESAI'
            },
            include: {
              _count: { select: { requests: true } },
              requests: { select: { status: true } }
            },
            orderBy: { tanggal: 'desc' },
            take: 30
          }
        },
        orderBy: { hari: 'asc' }
      })

      const rows: string[] = ['Kelas,Mata Pelajaran,Hari,Jam,Total Siswa,Sesi Terakhir,Hadir,Sakit,Izin,Alpha']
      for (const j of jadwal) {
        for (const sesi of j.sesi) {
          rows.push([
            `"${j.kelas.nama}"`,
            `"${j.mapel}"`,
            j.hari,
            `${j.jamMulai}-${j.jamSelesai}`,
            j.kelas._count.siswa.toString(),
            sesi.tanggal.toISOString().split('T')[0],
            sesi.requests.filter(r => r.status === 'HADIR').length.toString(),
            sesi.requests.filter(r => r.status === 'SAKIT').length.toString(),
            sesi.requests.filter(r => r.status === 'IZIN').length.toString(),
            sesi.requests.filter(r => r.status === 'ALPHA').length.toString()
          ].join(','))
        }
      }

      setResponseHeader(event, 'Content-Type', 'text/csv')
      setResponseHeader(event, 'Content-Disposition', 'attachment; filename=rekap-kelas.csv')
      return rows.join('\n')
    }

    default:
      throw createError({ statusCode: 400, statusMessage: `Tipe export "${type}" tidak dikenal` })
  }
})
