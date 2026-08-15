import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../server/utils/password'

const prisma = new PrismaClient()

const NAMA_DEPAN_PRI = ['Agus', 'Bambang', 'Catur', 'Dedi', 'Eko', 'Fajar', 'Guntur', 'Hendra', 'Imam', 'Joko', 'Kurnia', 'Lukman', 'Maman', 'Nanda', 'Oka', 'Puji', 'Rahmat', 'Surya', 'Taufik', 'Ujang', 'Wahyu', 'Yudi', 'Zainal', 'Arif', 'Bayu', 'Dimas', 'Farhan', 'Galih', 'Ilham', 'Rizky']
const NAMA_DEPAN_WANITA = ['Ayu', 'Dewi', 'Eka', 'Fitri', 'Gita', 'Hesti', 'Intan', 'Juwita', 'Kartika', 'Lestari', 'Maya', 'Nia', 'Ovi', 'Putri', 'Ratna', 'Sari', 'Tika', 'Umi', 'Vina', 'Wulan', 'Yuni', 'Zulaikha', 'Annisa', 'Citra', 'Dinda', 'Farah', 'Nabila', 'Salsabila', 'Zahra', 'Rahma']
const NAMA_BELAKANG = ['Pratama', 'Santoso', 'Wijaya', 'Nugroho', 'Saputra', 'Hidayat', 'Kurniawan', 'Susanto', 'Setiawan', 'Ramadhan', 'Firdaus', 'Maulana', 'Purnama', 'Utami', 'Permata', 'Anggraini', 'Wulandari', 'Saputri', 'Gunawan', 'Haryanto', 'Subekti', 'Prasetyo']
const NAMA_DEPAN_PANJANG = ['Muhammad', 'Abdurrahman', 'Fathurrahman', 'Muhammadiyah', 'Yudhistira', 'Satriawan', 'Prasetyaningrum', 'Nurhalimah', 'Syafruddin', 'Abdulhakim', 'Darmawansyah', 'Pramudito']
const NAMA_BELAKANG_PANJANG = ['Pamungkas', 'Alamsyah', 'Ramadhansyah', 'Kusumawijaya', 'Sejahterawan', 'Prawiradilaga', 'Muhammadzaki', 'Anandawijaya']
const GELAR_PTK = ['S.Pd.', 'M.Pd.', 'S.Kom.', 'S.Si.', 'S.E.', 'S.Pd.I.', 'M.T.']
const GELAR_PTK_DOUBLE = ['S.Pd., M.Pd.', 'S.Kom., M.Kom.', 'S.Si., M.Sc.', 'S.T., M.T.', 'S.E., M.M.', 'S.Pd.I., M.Pd.', 'S.H., M.H.', 'Dr., M.Pd.']
const KETERANGAN_PTK = ['Pendamping Mapel Matematika', 'Pendamping Mapel Bahasa Indonesia', 'Pendamping Mapel Bahasa Inggris', 'Pendamping Mapel Fisika', 'Pendamping Mapel Kimia', 'Pendamping Mapel Biologi', 'Pendamping Mapel Ekonomi', 'Pendamping Mapel Geografi', 'Pendamping Mapel Sejarah', 'Asisten Praktikum Lab Komputer', 'Asisten Praktikum Lab IPA', 'Pendamping Kelas Khusus', 'Pendamping Kegiatan Ekstrakurikuler', 'Pendamping Pembinaan Karakter', 'Pendamping Literasi Perpustakaan']

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '')
}

function buildPtkNama() {
  const r = Math.random()
  const depan = () => (Math.random() < 0.5 ? rand(NAMA_DEPAN_PRI) : rand(NAMA_DEPAN_WANITA))

  if (r < 0.15) {
    // Pendek — 1 kata + 1 gelar
    return `${depan()} ${rand(GELAR_PTK)}`
  }
  if (r < 0.6) {
    // Standar — 2 kata + 1 gelar
    return `${depan()} ${rand(NAMA_BELAKANG)}, ${rand(GELAR_PTK)}`
  }
  if (r < 0.9) {
    // Panjang — 3 kata + gelar ganda
    const blk = Math.random() < 0.5 ? rand(NAMA_BELAKANG) : rand(NAMA_BELAKANG_PANJANG)
    return `${depan()} ${rand(NAMA_BELAKANG)} ${blk}, ${rand(GELAR_PTK_DOUBLE)}`
  }
  // Sangat panjang — 4 kata + gelar ganda
  const blk1 = rand(NAMA_BELAKANG)
  const blk2 = rand(NAMA_BELAKANG_PANJANG)
  return `${rand(NAMA_DEPAN_PANJANG)} ${depan()} ${blk1} ${blk2}, ${rand(GELAR_PTK_DOUBLE)}`
}

function generatePtk(i: number) {
  const nama = buildPtkNama()
  return {
    nama,
    nip: String(197501010000000000n + BigInt(i)),
    email: `${slugify(nama.split(',')[0].trim())}-${i}@sekolah.sch.id`,
    nomorHp1: `0812${String(10000000 + i).padStart(8, '0')}`,
    nomorHp2: Math.random() < 0.3 ? `0857${String(50000000 + i).padStart(8, '0')}` : null
  }
}

function generatePtkPendamping(i: number) {
  return {
    nama: buildPtkNama(),
    nip: `1990${String(1000000000 + i).padStart(10, '0')}`,
    nomorHp: Math.random() < 0.8 ? `0859${String(60000000 + i).padStart(8, '0')}` : null,
    keterangan: rand(KETERANGAN_PTK),
    isActive: i < 28
  }
}

function buildMuridNama() {
  const r = Math.random()
  const depan = () => (Math.random() < 0.5 ? rand(NAMA_DEPAN_PRI) : rand(NAMA_DEPAN_WANITA))

  if (r < 0.15) {
    // Pendek — 1 kata
    return depan()
  }
  if (r < 0.65) {
    // Standar — 2 kata
    return `${depan()} ${rand(NAMA_BELAKANG)}`
  }
  if (r < 0.9) {
    // Panjang — 3 kata
    const blk = Math.random() < 0.5 ? rand(NAMA_BELAKANG) : rand(NAMA_BELAKANG_PANJANG)
    return `${depan()} ${rand(NAMA_BELAKANG)} ${blk}`
  }
  // Sangat panjang — 4 kata
  const blk1 = rand(NAMA_BELAKANG)
  const blk2 = rand(NAMA_BELAKANG_PANJANG)
  return `${rand(NAMA_DEPAN_PANJANG)} ${depan()} ${blk1} ${blk2}`
}

function generateMurid(i: number) {
  const pria = Math.random() < 0.5
  const nama = buildMuridNama()
  return {
    nama,
    nisn: String(9000000000 + i),
    nomorHp1: Math.random() < 0.7 ? `0813${String(20000000 + i).padStart(8, '0')}` : null,
    namaWali: `${pria ? 'Bpk' : 'Ibu'} ${nama}`,
    kontakWali: Math.random() < 0.8 ? `0821${String(30000000 + i).padStart(8, '0')}` : null
  }
}

async function main() {
  console.log('⏳ Menyiapkan data seed...')

  // Bersihkan data lama (urutan reverse dependensi)
  await prisma.absensiRequest.deleteMany()
  await prisma.izin.deleteMany()
  await prisma.sesiAbsensi.deleteMany()
  await prisma.jadwalPelajaran.deleteMany()
  await prisma.ptkPendamping.deleteMany()
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
    { nama: 'Muhammad Ahmad Fauzi Ramadhansyah Alamsyah, S.Pd., M.Pd.', nip: '197001012005011001', email: 'muhammad.ahmad.fauzi@sekolah.sch.id', nomorHp1: '081234567890', nomorHp2: '085712345678' },
    { nama: 'Siti Nurhaliza, S.Pd., M.Pd.', nip: '197207122006042002', email: 'siti.nurhaliza@sekolah.sch.id', nomorHp1: '082234567891', nomorHp2: null },
    { nama: 'Budi Santoso, S.Pd.', nip: '198003152007011003', email: 'budi.santoso@sekolah.sch.id', nomorHp1: '083234567892', nomorHp2: '087812345679' },
    { nama: 'Dewi Lestari Permata Kusumawijaya, S.Pd., M.Pd.', nip: '198205202008012004', email: 'dewi.lestari.permata@sekolah.sch.id', nomorHp1: '084234567893', nomorHp2: null },
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

  const guruTambahanCount = 30 - gurus.length
  for (let i = 0; i < guruTambahanCount; i++) {
    const g = generatePtk(i)
    const user = await prisma.user.create({
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
    gurus.push(user)
  }

  console.log(`✓ ${gurus.length} PTK dibuat`)

  // ============================================
  // PTK PENDAMPING (30 data)
  // ============================================
  const ptkPendampingCount = 30
  const ptkPendampingList: { id: number }[] = []
  for (let i = 0; i < ptkPendampingCount; i++) {
    const p = generatePtkPendamping(i)
    const created = await prisma.ptkPendamping.create({
      data: {
        nama: p.nama,
        nip: p.nip,
        nomorHp: p.nomorHp,
        keterangan: p.keterangan,
        isActive: p.isActive
      }
    })
    ptkPendampingList.push(created)
  }

  console.log(`✓ ${ptkPendampingCount} PTK pendamping dibuat`)

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

  // Assign 1 PTK pendamping per kelas (1-1)
  for (let i = 0; i < kelasList.length; i++) {
    await prisma.ptkPendamping.update({
      where: { id: ptkPendampingList[i].id },
      data: { kelasId: kelasList[i].id }
    })
  }
  console.log(`✓ ${kelasList.length} PTK pendamping di-assign ke kelas`)

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
    { nama: 'Muhammad Aditya Pratama Ramadhansyah', nisn: '1234567890', nomorHp1: '081234567801', namaWali: 'Bambang Pratama', kontakWali: '081234567890' },
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
    { nama: 'Muhammad Wahyu Hidayat Kusumawijaya', nisn: '3234567892', nomorHp1: null, namaWali: 'Hidayat', kontakWali: '081234567803' },
    { nama: 'Xena Olivia', nisn: '3234567893', nomorHp1: '081234567815', namaWali: 'Olivia', kontakWali: '081234567804' },
    { nama: 'Yoga Pratama', nisn: '3234567894', nomorHp1: null, namaWali: 'Pratama', kontakWali: null },
    // XII-B
    { nama: 'Zahra Anindita Puspita Kusumawijaya', nisn: '3234567895', nomorHp1: '081234567816', namaWali: 'Anindita', kontakWali: '081234567805' },
    { nama: 'Adi Saputra', nisn: '3234567896', nomorHp1: '081234567817', namaWali: 'Saputra', kontakWali: null },
    { nama: 'Citra Febriani', nisn: '3234567897', nomorHp1: null, namaWali: 'Febrianto', kontakWali: '081234567806' },
    { nama: 'Dimas Ardiansyah', nisn: '3234567898', nomorHp1: '081234567818', namaWali: 'Ardiansyah', kontakWali: '081234567807' },
    { nama: 'Elsa Nathania', nisn: '3234567899', nomorHp1: null, namaWali: 'Nathan', kontakWali: null },
  ]

  const targetMuridPerKelas = [34, 34, 33, 33, 33, 33]
  const NAMED_PER_KELAS = 5

  let idx = 0
  for (let k = 0; k < kelasList.length; k++) {
    const kelas = kelasList[k]
    const target = targetMuridPerKelas[k]
    for (let m = 0; m < target; m++) {
      const named = m < NAMED_PER_KELAS ? muridPerKelas[k * NAMED_PER_KELAS + m] : undefined
      const murid = named ?? generateMurid(idx)
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
      namaSekolah: 'SMK Negeri 1 Bandung',
      namaAplikasi: 'Aplikasi Skoria',
      titelAplikasi: 'EduPresensi | Sistem Absensi Digital',
      warnaUtama: '#0A66A0',
    }
  })

  console.log('✓ Pengaturan default dibuat')

  // ============================================
  // JADWAL PELAJARAN (lengkap Senin–Sabtu per kelas)
  // ============================================
  const [r1, r2, r3, r4, r5, r6, r7, r8, r9, r10] = await prisma.ruangan.findMany({ orderBy: { id: 'asc' } })

  // Ruang kelas utama per kelas (urutan kelasList): X-A, X-B, XI-A, XI-B, XII-A, XII-B
  const ruangKelasUtama = [r5, r6, r3, r4, r1, r2]
  const ruangLabKomputer = r7
  const ruangLabIpa = r8
  const ruangLabBahasa = r9
  const ruangPerpus = r10

  // Mapel yang memakai ruang khusus
  const RUANG_KHUSUS: Record<string, number> = {
    Informatika: ruangLabKomputer.id,
    Fisika: ruangLabIpa.id,
    Kimia: ruangLabIpa.id,
    Biologi: ruangLabIpa.id,
    'Bahasa Inggris': ruangLabBahasa.id,
    'Bahasa Sunda': ruangLabBahasa.id,
    'Literasi Perpustakaan': ruangPerpus.id,
    Sejarah: ruangPerpus.id
  }

  const MAPEL_PER_HARI: Record<string, string[]> = {
    SENIN: ['Pendidikan Agama', 'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'Informatika'],
    SELASA: ['PPKn', 'Fisika', 'Kimia', 'Sejarah', 'PJOK'],
    RABU: ['Matematika', 'Bahasa Indonesia', 'Biologi', 'Ekonomi', 'Seni Budaya'],
    KAMIS: ['Bahasa Inggris', 'Geografi', 'Prakarya & Kewirausahaan', 'Dasar Program Keahlian', 'Bahasa Sunda'],
    JUMAT: ['Fisika', 'Kimia', 'Matematika', 'Bahasa Indonesia', 'Dasar Program Keahlian'],
    SABTU: ['Pembinaan Karakter', 'Ekstrakurikuler', 'Literasi Perpustakaan']
  }

  const SLOT_PER_HARI: Record<string, { jamMulai: string; jamSelesai: string }[]> = {
    SENIN: [
      { jamMulai: '07:00', jamSelesai: '08:30' },
      { jamMulai: '08:30', jamSelesai: '10:00' },
      { jamMulai: '10:00', jamSelesai: '11:30' },
      { jamMulai: '12:00', jamSelesai: '13:30' },
      { jamMulai: '13:30', jamSelesai: '15:00' }
    ],
    SELASA: [
      { jamMulai: '07:00', jamSelesai: '08:30' },
      { jamMulai: '08:30', jamSelesai: '10:00' },
      { jamMulai: '10:00', jamSelesai: '11:30' },
      { jamMulai: '12:00', jamSelesai: '13:30' },
      { jamMulai: '13:30', jamSelesai: '15:00' }
    ],
    RABU: [
      { jamMulai: '07:00', jamSelesai: '08:30' },
      { jamMulai: '08:30', jamSelesai: '10:00' },
      { jamMulai: '10:00', jamSelesai: '11:30' },
      { jamMulai: '12:00', jamSelesai: '13:30' },
      { jamMulai: '13:30', jamSelesai: '15:00' }
    ],
    KAMIS: [
      { jamMulai: '07:00', jamSelesai: '08:30' },
      { jamMulai: '08:30', jamSelesai: '10:00' },
      { jamMulai: '10:00', jamSelesai: '11:30' },
      { jamMulai: '12:00', jamSelesai: '13:30' },
      { jamMulai: '13:30', jamSelesai: '15:00' }
    ],
    JUMAT: [
      { jamMulai: '07:00', jamSelesai: '08:30' },
      { jamMulai: '08:30', jamSelesai: '10:00' },
      { jamMulai: '10:00', jamSelesai: '11:30' },
      { jamMulai: '12:00', jamSelesai: '13:30' },
      { jamMulai: '13:30', jamSelesai: '15:00' }
    ],
    SABTU: [
      { jamMulai: '07:00', jamSelesai: '08:30' },
      { jamMulai: '08:30', jamSelesai: '10:00' },
      { jamMulai: '10:00', jamSelesai: '11:30' }
    ]
  }

  const HARI_URUTAN = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU']

  const jadwalData: {
    kelasIdx: number
    mapel: string
    guruIdx: number
    ruanganId: number
    hari: string
    jamMulai: string
    jamSelesai: string
  }[] = []

  for (let k = 0; k < kelasList.length; k++) {
    const offset = k // rotasi mapel agar jadwal tiap kelas berbeda
    for (const hari of HARI_URUTAN) {
      const mapels = MAPEL_PER_HARI[hari]
      const slots = SLOT_PER_HARI[hari]
      mapels.forEach((_m, s) => {
        const mapel = mapels[(s + offset) % mapels.length]
        const guruIdx = (k * 5 + s + HARI_URUTAN.indexOf(hari)) % gurus.length
        const ruanganId = RUANG_KHUSUS[mapel] ?? ruangKelasUtama[k].id
        jadwalData.push({
          kelasIdx: k,
          mapel,
          guruIdx,
          ruanganId,
          hari,
          jamMulai: slots[s].jamMulai,
          jamSelesai: slots[s].jamSelesai
        })
      })
    }
  }

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

  // Ambil 1 jadwal per kelas sebagai demo sesi absensi (jadwal Senin slot pertama)
  const slotsPerKelas = HARI_URUTAN.reduce((acc, h) => acc + SLOT_PER_HARI[h].length, 0)
  const demoJadwalIdx = kelasList.map((_k, k) => k * slotsPerKelas)

  for (let ji = 0; ji < demoJadwalIdx.length; ji++) {
    const di = demoJadwalIdx[ji]
    const jadwal = jadwalList[di]
    const kelas = kelasList[jadwalData[di].kelasIdx]

    // Ambil semua murid di kelas ini
    const siswaDiKelas = await prisma.siswa.findMany({
      where: { kelasId: kelas.id },
      select: { id: true }
    })

    // Sesinya: today (AKTIF untuk 3 kelas pertama, SELESAI untuk 3 lainnya)
    const sesiTanggal = ji < 3 ? today : yesterday
    const sesiStatus = ji < 3 ? 'AKTIF' : 'SELESAI'

    const sesi = await prisma.sesiAbsensi.create({
      data: {
        jadwalId: jadwal.id,
        tanggal: sesiTanggal,
        status: sesiStatus,
        dibukaOleh: gurus[jadwalData[di].guruIdx].id
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
            approvedBy: gurus[jadwalData[di].guruIdx].id,
            approvedAt: new Date(sesiTanggal.getTime() + 8 * 60 * 60 * 1000)
          }
        })
        totalRequests++
      }
    }

    // Kelas 2 & 5 juga bikin sesi SELESAI tambahan (minggu lalu)
    const tambahanTanggal = ji === 1 || ji === 4 ? lastWeek : null
    if (tambahanTanggal) {
      const sesiLama = await prisma.sesiAbsensi.create({
        data: {
          jadwalId: jadwal.id,
          tanggal: tambahanTanggal,
          status: 'SELESAI',
          dibukaOleh: gurus[jadwalData[di].guruIdx].id
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
            approvedBy: gurus[jadwalData[di].guruIdx].id,
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
  console.log(`  PTK Pendamping : ${ptkPendampingCount} orang`)
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
