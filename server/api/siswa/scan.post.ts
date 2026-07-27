import { z } from 'zod'

const bodySchema = z.object({
  qrCode: z.string().min(1, 'QR Code tidak boleh kosong')
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Silakan login terlebih dahulu' })
  }

  const user = session.user
  const siswa = await prisma.siswa.findUnique({ where: { userId: user.id } })
  if (!siswa) {
    throw createError({ statusCode: 404, statusMessage: 'Data siswa tidak ditemukan' })
  }

  const result = bodySchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.error.issues[0].message })
  }

  const { qrCode } = result.data

  const ruangan = await prisma.ruangan.findUnique({ where: { qrCode } })
  if (!ruangan) {
    throw createError({ statusCode: 404, statusMessage: 'QR Code tidak valid' })
  }

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const todayDate = new Date(today)
  const timeNow = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const activeSesi = await prisma.sesiAbsensi.findFirst({
    where: {
      status: 'AKTIF',
      tanggal: todayDate,
      jadwal: {
        ruanganId: ruangan.id,
        jamMulai: { lte: timeNow },
        jamSelesai: { gte: timeNow }
      }
    },
    include: {
      jadwal: {
        include: {
          kelas: { select: { id: true, nama: true } },
          guru: { select: { id: true, nama: true } }
        }
      }
    }
  })

  if (!activeSesi) {
    const allTodaySesi = await prisma.sesiAbsensi.findFirst({
      where: {
        status: 'AKTIF',
        tanggal: todayDate,
        jadwal: { ruanganId: ruangan.id }
      },
      include: { jadwal: true }
    })

    if (allTodaySesi) {
      return {
        success: false,
        message: `Sesi di ruangan ini belum waktunya (jadwal: ${allTodaySesi.jadwal.jamMulai} - ${allTodaySesi.jadwal.jamSelesai})`,
        ruangan: { id: ruangan.id, nama: ruangan.nama }
      }
    }

    return {
      success: false,
      message: 'Tidak ada sesi aktif di ruangan ini saat ini',
      ruangan: { id: ruangan.id, nama: ruangan.nama }
    }
  }

  if (activeSesi.jadwal.kelasId !== siswa.kelasId) {
    return {
      success: false,
      message: `Ruangan ini sedang digunakan oleh kelas ${activeSesi.jadwal.kelas.nama}. Anda bukan anggota kelas ini.`,
      ruangan: { id: ruangan.id, nama: ruangan.nama },
      sesi: {
        id: activeSesi.id,
        mapel: activeSesi.jadwal.mapel,
        kelas: activeSesi.jadwal.kelas.nama
      }
    }
  }

  const existingRequest = await prisma.absensiRequest.findUnique({
    where: {
      sesiId_siswaId: {
        sesiId: activeSesi.id,
        siswaId: siswa.id
      }
    }
  })

  if (existingRequest) {
    return {
      success: true,
      alreadyScanned: true,
      message: `Kamu sudah melakukan absensi sebelumnya. Status: ${statusLabel(existingRequest.status)}`,
      status: existingRequest.status,
      scannedAt: existingRequest.scannedAt,
      ruangan: { id: ruangan.id, nama: ruangan.nama },
      sesi: {
        id: activeSesi.id,
        mapel: activeSesi.jadwal.mapel,
        kelas: activeSesi.jadwal.kelas.nama,
        jamMulai: activeSesi.jadwal.jamMulai,
        jamSelesai: activeSesi.jadwal.jamSelesai,
        guru: activeSesi.jadwal.guru.nama
      }
    }
  }

  const absensiRequest = await prisma.absensiRequest.create({
    data: {
      sesiId: activeSesi.id,
      siswaId: siswa.id,
      scannedAt: now,
      status: 'PENDING'
    }
  })

  return {
    success: true,
    alreadyScanned: false,
    message: 'Absensi berhasil dikirim. Menunggu konfirmasi guru.',
    status: absensiRequest.status,
    scannedAt: absensiRequest.scannedAt,
    ruangan: { id: ruangan.id, nama: ruangan.nama },
    sesi: {
      id: activeSesi.id,
      mapel: activeSesi.jadwal.mapel,
      kelas: activeSesi.jadwal.kelas.nama,
      jamMulai: activeSesi.jadwal.jamMulai,
      jamSelesai: activeSesi.jadwal.jamSelesai,
      guru: activeSesi.jadwal.guru.nama
    }
  }
})

function statusLabel(s: string) {
  const map: Record<string, string> = {
    PENDING: 'Menunggu Konfirmasi',
    HADIR: 'Hadir',
    SAKIT: 'Sakit',
    IZIN: 'Izin',
    ALPHA: 'Alpha'
  }
  return map[s] || s
}
