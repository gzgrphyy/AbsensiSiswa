import type { JenisKelamin } from '@prisma/client'

// Kumpulan nama depan (dan kata kunci) yang jelas gender-nya,
// berasal dari pool nama seed + nama-nama eksplisit di seed.
export const NAMA_LAKI = new Set([
  // pool pria seed
  'Agus', 'Bambang', 'Catur', 'Dedi', 'Eko', 'Fajar', 'Guntur', 'Hendra', 'Imam', 'Joko',
  'Kurnia', 'Lukman', 'Maman', 'Nanda', 'Oka', 'Puji', 'Rahmat', 'Surya', 'Taufik', 'Ujang',
  'Wahyu', 'Yudi', 'Zainal', 'Arif', 'Bayu', 'Dimas', 'Farhan', 'Galih', 'Ilham', 'Rizky',
  // pool panjang yang pria
  'Muhammad', 'Abdurrahman', 'Fathurrahman', 'Muhammadiyah', 'Yudhistira', 'Satriawan',
  'Syafruddin', 'Abdulhakim', 'Darmawansyah', 'Pramudito', 'Abdul', 'Ahmad',
  // nama eksplisit / umum
  'Budi', 'Fauzi', 'Susilo', 'Gunawan', 'Santoso', 'Ramadhansyah', 'Alamsyah', 'Pratama',
  'Setiawan', 'Hidayat', 'Kurniawan', 'Wijaya', 'Prasetyo', 'Kusuma', 'Ramadan', 'Akbar',
  'Alexander', 'Saputra', 'Ardiansyah', 'Nathan', 'Pradana', 'Dewanto', 'Puspito',
  'Sukirman', 'Supardi', 'Febrianto', 'Nabil', 'Al', 'Faruq', 'Yoga', 'Adi',
  'Teguh', 'Gilang', 'Indra', 'Kevin', 'Oscar', 'Rafi', 'Umar', 'Yusuf', 'Andi',
  'Herman', 'Slamet', 'Supriyadi', 'Sutrisno', 'Nugroho', 'Haryanto', 'Subekti', 'Maulana',
])

export const NAMA_PEREMPUAN = new Set([
  // pool wanita seed
  'Ayu', 'Dewi', 'Eka', 'Fitri', 'Gita', 'Hesti', 'Intan', 'Juwita', 'Kartika', 'Lestari',
  'Maya', 'Nia', 'Ovi', 'Putri', 'Ratna', 'Sari', 'Tika', 'Umi', 'Vina', 'Wulan',
  'Yuni', 'Zulaikha', 'Annisa', 'Citra', 'Dinda', 'Farah', 'Nabila', 'Salsabila', 'Zahra', 'Rahma',
  // pool panjang yang wanita
  'Prasetyaningrum', 'Nurhalimah',
  // nama eksplisit / umum
  'Siti', 'Nurhaliza', 'Rina', 'Handayani', 'Permata', 'Kusumawijaya',
  'Oktaviani', 'Bella', 'Dian', 'Hani', 'Jihan', 'Larasati', 'Nurul', 'Qori',
  'Salsa', 'Xena', 'Anindita', 'Puspita', 'Elsa', 'Febriani',
  'Aisyah', 'Ayunda', 'Amalia', 'Nathania', 'Hidayah',
  // marga yang jelas feminin
  'Utami', 'Anggraini', 'Wulandari', 'Saputri', 'Purnama',
])

const GELAR = /(^|\s)(S\.Pd|M\.Pd|S\.Kom|S\.Si|S\.E|S\.Pd\.I|M\.T|S\.T|M\.M|S\.H|M\.H|Dr|M\.Sc|M\.Kom|S\.S\.I)\b/i

function tokenize(nama: string): string[] {
  return nama
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1)
    .filter(t => !GELAR.test(t))
    .filter(t => t !== 'M') // singkatan "M." (M. Rizky) jangan dihitung
}

export function inferJK(nama: string): JenisKelamin | null {
  const tokens = tokenize(nama)
  if (tokens.length === 0) return null

  // Nama depan (token pertama) adalah penentu utama — data seed selalu
  // memakai nama depan dari pool gender tertentu.
  const first = tokens[0]
  if (NAMA_LAKI.has(first)) return 'LAKI_LAKI'
  if (NAMA_PEREMPUAN.has(first)) return 'PEREMPUAN'

  // Fallback: hitung semua kata yang dikenal gendernya
  let male = 0
  let female = 0
  for (const t of tokens) {
    if (NAMA_LAKI.has(t)) male++
    if (NAMA_PEREMPUAN.has(t)) female++
  }
  if (male > female) return 'LAKI_LAKI'
  if (female > male) return 'PEREMPUAN'
  return null
}
