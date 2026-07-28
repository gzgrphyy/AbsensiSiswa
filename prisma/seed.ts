import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../server/utils/password'

const prisma = new PrismaClient()

async function main() {
  console.log('⏳ Menyiapkan data seed...')

  // Bersihkan data lama (urutan reverse dependensi)
  await prisma.absensiRequest.deleteMany()
  await prisma.sesiAbsensi.deleteMany()
  await prisma.jadwalPelajaran.deleteMany()
  await prisma.siswa.deleteMany()
  await prisma.kelas.deleteMany()
  await prisma.ruangan.deleteMany()
  await prisma.user.deleteMany()
  await prisma.pengaturan.deleteMany()
  await prisma.tahunAjaran.deleteMany()

  console.log('✓ Data lama dibersihkan')

  const adminHash = hashPassword('Admin123')
  const guruHash = hashPassword('Guru123')
  const siswaHash = hashPassword('Siswa123')

  // ============================================
  // ADMIN
  // ============================================
  await prisma.user.create({
    data: {
      nama: 'Admin Utama',
      email: 'admin@absensi.test',
      passwordHash: adminHash,
      role: 'ADMIN'
    }
  })

  // ============================================
  // TAHUN AJARAN
  // ============================================
  const ta1 = await prisma.tahunAjaran.create({
    data: { nama: '2025/2026', semester: 'GANJIL', isActive: false }
  })
  const ta2 = await prisma.tahunAjaran.create({
    data: { nama: '2025/2026', semester: 'GENAP', isActive: false }
  })
  const ta3 = await prisma.tahunAjaran.create({
    data: { nama: '2026/2027', semester: 'GANJIL', isActive: true }
  })

  console.log('✓ Tahun Ajaran dibuat')

  // ============================================
  // PTK / GURU
  // ============================================
  const guruData = [
    { nama: 'Ahmad Fauzi, S.Pd., M.Pd.', nip: '197001012005011001', email: 'ahmad.fauzi@sekolah.sch.id', nomorHp1: '081234567890', nomorHp2: '085712345678' },
    { nama: 'Siti Nurhaliza, S.Pd., M.Pd.', nip: '197207122006042002', email: 'siti.nurhaliza@sekolah.sch.id', nomorHp1: '082234567891', nomorHp2: null },
    { nama: 'Budi Santoso, S.Pd.', nip: '198003152007011003', email: 'budi.santoso@sekolah.sch.id', nomorHp1: '083234567892', nomorHp2: '087812345679' },
    { nama: 'Dewi Lestari, S.Pd.', nip: '198205202008012004', email: 'dewi.lestari@sekolah.sch.id', nomorHp1: '084234567893', nomorHp2: null },
    { nama: 'Joko Susilo, S.Kom.', nip: '198307112009021005', email: 'joko.susilo@sekolah.sch.id', nomorHp1: '085234567894', nomorHp2: '089912345680' },
    { nama: 'Rina Wijaya, S.Si.', nip: '198408122010032006', email: 'rina.wijaya@sekolah.sch.id', nomorHp1: '086234567895', nomorHp2: null },
    { nama: 'Hendra Gunawan, S.Pd.I.', nip: '198509132011041007', email: 'hendra.gunawan@sekolah.sch.id', nomorHp1: '087234567896', nomorHp2: null },
    { nama: 'Fitri Handayani, S.E.', nip: '198610142012052008', email: 'fitri.handayani@sekolah.sch.id', nomorHp1: '088234567897', nomorHp2: '085512345681' },
  ]

  const gurus = await Promise.all(
    guruData.map(g =>
      prisma.user.create({
        data: {
          nama: g.nama,
          nip: g.nip,
          email: g.email,
          nomorHp1: g.nomorHp1,
          nomorHp2: g.nomorHp2,
          passwordHash: guruHash,
          role: 'GURU',
          isActive: true
        }
      })
    )
  )

  console.log(`✓ ${gurus.length} PTK dibuat`)

  // ============================================
  // KELAS
  // ============================================
  const kelasData = [
    { nama: 'X-A', wali: gurus[0] },   // Ahmad Fauzi
    { nama: 'X-B', wali: gurus[3] },   // Dewi Lestari
    { nama: 'XI-A', wali: gurus[1] },  // Siti Nurhaliza
    { nama: 'XI-B', wali: gurus[2] },  // Budi Santoso
    { nama: 'XII-A', wali: gurus[4] }, // Joko Susilo
    { nama: 'XII-B', wali: gurus[5] }, // Rina Wijaya
  ]

  const kelasList = await Promise.all(
    kelasData.map(k =>
      prisma.kelas.create({
        data: {
          nama: k.nama,
          waliKelasId: k.wali.id,
          tahunAjaranId: ta3.id
        }
      })
    )
  )

  console.log(`✓ ${kelasList.length} kelas dibuat`)

  // ============================================
  // RUANGAN
  // ============================================
  const ruanganData = [
    { nama: 'XII-A', jenis: 'KELAS', qrCode: 'R-001' },
    { nama: 'XII-B', jenis: 'KELAS', qrCode: 'R-002' },
    { nama: 'XI-A', jenis: 'KELAS', qrCode: 'R-003' },
    { nama: 'XI-B', jenis: 'KELAS', qrCode: 'R-004' },
    { nama: 'X-A', jenis: 'KELAS', qrCode: 'R-009' },
    { nama: 'X-B', jenis: 'KELAS', qrCode: 'R-010' },
    { nama: 'Lab Komputer', jenis: 'LAB', qrCode: 'R-005' },
    { nama: 'Lab IPA', jenis: 'LAB', qrCode: 'R-006' },
    { nama: 'Lab Bahasa', jenis: 'LAB', qrCode: 'R-007' },
    { nama: 'Perpustakaan', jenis: 'PERPUSTAKAAN', qrCode: 'R-008' },
  ]

  await Promise.all(
    ruanganData.map(r =>
      prisma.ruangan.create({
        data: { nama: r.nama, jenis: r.jenis as any, qrCode: r.qrCode }
      })
    )
  )

  console.log(`✓ ${ruanganData.length} ruangan dibuat`)

  // ============================================
  // MURID / SISWA (masing-masing kelas 5 murid)
  // ============================================
  const muridPerKelas = [
    // X-A
    { nama: 'Aditya Pratama', nisn: '1234567890', nomorHp1: '081234567801', namaWali: 'Bambang Pratama', kontakWali: '081234567890' },
    { nama: 'Bella Oktaviani', nisn: '1234567891', nomorHp1: '081234567802', namaWali: 'Sukirman', kontakWali: null },
    { nama: 'Candra Wijaya', nisn: '1234567892', nomorHp1: null, namaWali: 'Hendra Wijaya', kontakWali: '081234567891' },
    { nama: 'Dian Permata Sari', nisn: '1234567893', nomorHp1: '081234567803', namaWali: 'Agus Sari', kontakWali: '081234567892' },
    { nama: 'Eko Prasetyo', nisn: '1234567894', nomorHp1: null, namaWali: 'Prasetyo', kontakWali: null },
    // X-B
    { nama: 'Fitri Ayu Lestari', nisn: '1234567895', nomorHp1: '081234567804', namaWali: 'Supardi', kontakWali: '081234567893' },
    { nama: 'Gilang Ramadan', nisn: '1234567896', nomorHp1: '081234567805', namaWali: 'Ramadan', kontakWali: null },
    { nama: 'Hani Puspita Sari', nisn: '1234567897', nomorHp1: null, namaWali: 'Puspito', kontakWali: '081234567894' },
    { nama: 'Indra Kusuma', nisn: '1234567898', nomorHp1: '081234567806', namaWali: 'Kusuma', kontakWali: '081234567895' },
    { nama: 'Jihan Nabila', nisn: '1234567899', nomorHp1: null, namaWali: 'Nabil', kontakWali: null },
    // XI-A
    { nama: 'Kevin Alexander', nisn: '2234567890', nomorHp1: '081234567807', namaWali: 'Alexander', kontakWali: '081234567896' },
    { nama: 'Larasati Dewi', nisn: '2234567891', nomorHp1: '081234567808', namaWali: 'Dewanto', kontakWali: null },
    { nama: 'M. Rizky Fauzi', nisn: '2234567892', nomorHp1: null, namaWali: 'Fauzi Ahmad', kontakWali: '081234567897' },
    { nama: 'Nurul Hidayah', nisn: '2234567893', nomorHp1: '081234567809', namaWali: 'Hidayat', kontakWali: '081234567898' },
    { nama: 'Oscar Pradana', nisn: '2234567894', nomorHp1: null, namaWali: 'Pradana', kontakWali: null },
    // XI-B
    { nama: 'Putri Ayunda', nisn: '2234567895', nomorHp1: '081234567810', namaWali: 'Ayunda', kontakWali: '081234567899' },
    { nama: 'Qori Aisyah', nisn: '2234567896', nomorHp1: '081234567811', namaWali: 'Aisyah', kontakWali: null },
    { nama: 'Rafi Akbar', nisn: '2234567897', nomorHp1: null, namaWali: 'Akbar', kontakWali: '081234567800' },
    { nama: 'Salsa Bila Rahma', nisn: '2234567898', nomorHp1: '081234567812', namaWali: 'Rahmat', kontakWali: '081234567801' },
    { nama: 'Teguh Setiawan', nisn: '2234567899', nomorHp1: null, namaWali: 'Setiawan', kontakWali: null },
    // XII-A
    { nama: 'Umar Al-Faruq', nisn: '3234567890', nomorHp1: '081234567813', namaWali: 'Al-Faruq', kontakWali: '081234567802' },
    { nama: 'Vina Amalia', nisn: '3234567891', nomorHp1: '081234567814', namaWali: 'Amalia', kontakWali: null },
    { nama: 'Wahyu Hidayat', nisn: '3234567892', nomorHp1: null, namaWali: 'Hidayat', kontakWali: '081234567803' },
    { nama: 'Xena Olivia', nisn: '3234567893', nomorHp1: '081234567815', namaWali: 'Olivia', kontakWali: '081234567804' },
    { nama: 'Yoga Pratama', nisn: '3234567894', nomorHp1: null, namaWali: 'Pratama', kontakWali: null },
    // XII-B
    { nama: 'Zahra Anindita', nisn: '3234567895', nomorHp1: '081234567816', namaWali: 'Anindita', kontakWali: '081234567805' },
    { nama: 'Adi Saputra', nisn: '3234567896', nomorHp1: '081234567817', namaWali: 'Saputra', kontakWali: null },
    { nama: 'Citra Febriani', nisn: '3234567897', nomorHp1: null, namaWali: 'Febrianto', kontakWali: '081234567806' },
    { nama: 'Dimas Ardiansyah', nisn: '3234567898', nomorHp1: '081234567818', namaWali: 'Ardiansyah', kontakWali: '081234567807' },
    { nama: 'Elsa Nathania', nisn: '3234567899', nomorHp1: null, namaWali: 'Nathan', kontakWali: null },
  ]

  let idx = 0
  for (let k = 0; k < kelasList.length; k++) {
    const kelas = kelasList[k]
    for (let m = 0; m < 5; m++) {
      const murid = muridPerKelas[idx]
      const user = await prisma.user.create({
        data: {
          nama: murid.nama,
          email: `siswa${idx + 1}@absensi.test`,
          passwordHash: siswaHash,
          role: 'SISWA',
          isActive: true
        }
      })
      await prisma.siswa.create({
        data: {
          userId: user.id,
          nisn: murid.nisn,
          nama: murid.nama,
          kelasId: kelas.id,
          nomorHp1: murid.nomorHp1,
          namaWali: murid.namaWali,
          kontakWali: murid.kontakWali
        }
      })
      idx++
    }
  }

  console.log(`✓ ${idx} murid dibuat`)

  // ============================================
  // PENGATURAN
  // ============================================
  await prisma.pengaturan.create({
    data: {
      namaAplikasi: 'Aplikasi Skoria',
      titelAplikasi: 'Sistem Absensi',
    }
  })

  console.log('✓ Pengaturan default dibuat')

  // ============================================
  // JADWAL PELAJARAN (1 jadwal per kelas)
  // ============================================
  const [r1, r2, r3, r4, r5, r6, r7, r8, r9, r10] = await prisma.ruangan.findMany({ orderBy: { id: 'asc' } })

  const jadwalData = [
    { kelasIdx: 0, mapel: 'Matematika', guruIdx: 2, ruanganId: r5.id, hari: 'SENIN', jamMulai: '07:00', jamSelesai: '08:30' },
    { kelasIdx: 1, mapel: 'Bahasa Indonesia', guruIdx: 3, ruanganId: r6.id, hari: 'SENIN', jamMulai: '07:00', jamSelesai: '08:30' },
    { kelasIdx: 2, mapel: 'Fisika', guruIdx: 5, ruanganId: r7.id, hari: 'SENIN', jamMulai: '08:30', jamSelesai: '10:00' },
    { kelasIdx: 3, mapel: 'Biologi', guruIdx: 1, ruanganId: r8.id, hari: 'SELASA', jamMulai: '07:00', jamSelesai: '08:30' },
    { kelasIdx: 4, mapel: 'Bahasa Inggris', guruIdx: 4, ruanganId: r1.id, hari: 'SENIN', jamMulai: '10:00', jamSelesai: '11:30' },
    { kelasIdx: 5, mapel: 'Ekonomi', guruIdx: 7, ruanganId: r2.id, hari: 'SENIN', jamMulai: '07:00', jamSelesai: '08:30' },
  ]

  const jadwalList = await Promise.all(
    jadwalData.map(j =>
      prisma.jadwalPelajaran.create({
        data: {
          kelasId: kelasList[j.kelasIdx].id,
          mapel: j.mapel,
          guruId: gurus[j.guruIdx].id,
          ruanganId: j.ruanganId,
          hari: j.hari as any,
          jamMulai: j.jamMulai,
          jamSelesai: j.jamSelesai
        }
      })
    )
  )

  console.log(`✓ ${jadwalList.length} jadwal pelajaran dibuat`)

  // ============================================
  // SESI ABSENSI & ABSENSI REQUEST
  // ============================================
  const today = new Date(new Date().toISOString().split('T')[0])
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 5)

  const statusPool: ('HADIR' | 'SAKIT' | 'IZIN' | 'ALPHA')[] = ['HADIR', 'HADIR', 'HADIR', 'HADIR', 'HADIR', 'HADIR', 'HADIR', 'SAKIT', 'IZIN', 'ALPHA']

  let totalSesi = 0
  let totalRequests = 0

  for (let ji = 0; ji < jadwalList.length; ji++) {
    const jadwal = jadwalList[ji]
    const kelas = kelasList[jadwalData[ji].kelasIdx]

    // Ambil semua murid di kelas ini
    const siswaDiKelas = await prisma.siswa.findMany({
      where: { kelasId: kelas.id },
      select: { id: true }
    })

    // Sesinya: today (AKTIF untuk 3 jadwal, SELESAI untuk 3 lainnya)
    const sesiTanggal = ji < 3 ? today : yesterday
    const sesiStatus = ji < 3 ? 'AKTIF' : 'SELESAI'

    const sesi = await prisma.sesiAbsensi.create({
      data: {
        jadwalId: jadwal.id,
        tanggal: sesiTanggal,
        status: sesiStatus,
        dibukaOleh: gurus[jadwalData[ji].guruIdx].id
      }
    })
    totalSesi++

    // Untuk sesi SELESAI, buat AbsensiRequest untuk setiap murid
    if (sesiStatus === 'SELESAI') {
      for (const ssw of siswaDiKelas) {
        const randStatus = statusPool[Math.floor(Math.random() * statusPool.length)]
        await prisma.absensiRequest.create({
          data: {
            sesiId: sesi.id,
            siswaId: ssw.id,
            status: randStatus,
            scannedAt: new Date(sesiTanggal.getTime() + 7 * 60 * 60 * 1000 + Math.random() * 2 * 60 * 60 * 1000),
            approvedBy: gurus[jadwalData[ji].guruIdx].id,
            approvedAt: new Date(sesiTanggal.getTime() + 8 * 60 * 60 * 1000)
          }
        })
        totalRequests++
      }
    }

    // Jadwal 2 & 5 juga bikin sesi SELESAI tambahan (kemarin/lusa)
    const tambahanTanggal = ji === 1 || ji === 4 ? lastWeek : null
    if (tambahanTanggal) {
      const sesiLama = await prisma.sesiAbsensi.create({
        data: {
          jadwalId: jadwal.id,
          tanggal: tambahanTanggal,
          status: 'SELESAI',
          dibukaOleh: gurus[jadwalData[ji].guruIdx].id
        }
      })
      totalSesi++

      for (const ssw of siswaDiKelas) {
        const randStatus = statusPool[Math.floor(Math.random() * statusPool.length)]
        await prisma.absensiRequest.create({
          data: {
            sesiId: sesiLama.id,
            siswaId: ssw.id,
            status: randStatus,
            scannedAt: new Date(tambahanTanggal.getTime() + 7 * 60 * 60 * 1000 + Math.random() * 2 * 60 * 60 * 1000),
            approvedBy: gurus[jadwalData[ji].guruIdx].id,
            approvedAt: new Date(tambahanTanggal.getTime() + 8 * 60 * 60 * 1000)
          }
        })
        totalRequests++
      }
    }
  }

  console.log(`✓ ${totalSesi} sesi absensi dibuat`)
  console.log(`✓ ${totalRequests} absensi request dibuat`)
  console.log('')
  console.log('====================================')
  console.log('  SEED BERHASIL!')
  console.log('====================================')
  console.log('  ADMIN : admin@absensi.test / Admin123')
  console.log('  GURU  : semua guru password: Guru123')
  console.log('  SISWA : semua siswa password: Siswa123')
  console.log(`  PTK   : ${gurus.length} orang`)
  console.log(`  Kelas : ${kelasList.length} kelas`)
  console.log(`  Murid : ${idx} siswa`)
  console.log(`  Ruangan: ${ruanganData.length} ruangan`)
  console.log(`  Jadwal : ${jadwalList.length} jadwal`)
  console.log(`  Sesi   : ${totalSesi} sesi`)
  console.log(`  Absensi: ${totalRequests} request`)
  console.log('====================================')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
