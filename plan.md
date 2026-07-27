# Project Planning — Sistem Absensi Siswa

## 1. Ringkasan Project

Aplikasi absensi siswa untuk sekolah yang dikembangkan sebagai project sederhana (bukan production-grade), menggunakan stack yang konsisten dengan project KosTagih/KOSFLOW agar proses development lebih cepat dan maintainable.

Absensi dilakukan siswa secara mandiri lewat scan QR yang ditempel di masing-masing ruangan, lalu dikonfirmasi oleh guru sebelum berstatus final — mirip pola verifikasi dua tahap yang sudah dipakai di KosTagih untuk pembayaran (PENDING → diverifikasi manusia).

### Tujuan
Membantu guru dalam melakukan pencatatan absensi harian secara lebih cepat dan akurat, serta memudahkan admin dalam mengelola data siswa, kelas, guru, jadwal, dan menghasilkan laporan absensi.

### Prinsip Pengembangan
- Sederhana dan fungsional.
- Fokus pada kebutuhan utama sekolah.
- Verifikasi tetap melibatkan manusia (guru) agar tidak mudah dimanipulasi.
- Mudah dikembangkan kembali di masa depan.
- Menggunakan stack yang sudah familiar agar development lebih cepat.

---

# 2. Aktor & Hak Akses

| Aktor | Hak Akses |
|--------|------------|
| **Admin** | Kelola seluruh data master (siswa, kelas, guru, tahun ajaran, ruangan, jadwal pelajaran), melihat monitoring real-time semua ruangan, melihat seluruh laporan, serta mengelola sistem. |
| **Guru / Wali Kelas** | Membuka & menutup sesi kelas, melihat daftar siswa yang scan QR secara real-time, mengonfirmasi/menolak kehadiran, override manual (Hadir/Sakit/Izin/Alpha), melihat riwayat & rekap absensi kelas yang diampu. |
| **Siswa** | Login dengan akun sendiri, scan QR ruangan saat masuk/pindah kelas, melihat status absensinya sendiri secara real-time (menunggu/hadir/ditolak), melihat riwayat absensi pribadi. |

---

# 3. Tech Stack

Stack berikut bersifat **FIX** dan tidak direncanakan berubah selama proses pengembangan.

| Komponen | Teknologi | Catatan |
|-----------|-----------|----------|
| Framework | Nuxt 3 + Nitro | Reuse pola project KOSFLOW |
| Database | MySQL | Skema sederhana, cukup menggunakan MySQL |
| Database Runtime | Laragon | Tanpa Docker |
| ORM | Prisma | Provider menggunakan MySQL |
| Styling | Tailwind CSS | Utility First CSS |
| Authentication | nuxt-auth-utils | Session Authentication, dipakai untuk ADMIN, GURU, dan SISWA |
| Validation | Zod | Validasi request |
| Export Excel | ExcelJS | Pembuatan laporan Excel |
| QR Generate/Scan | *Belum diputuskan* | Perlu riset library (generate QR statis per ruangan + scan dari browser/kamera HP) |

### Catatan

Perbedaan utama MySQL dan PostgreSQL yang perlu diperhatikan:

- MySQL menggunakan kolom `ENUM`.
- PostgreSQL menggunakan native Enum Type.
- MySQL umumnya tidak sensitif terhadap huruf besar/kecil nama tabel (bergantung OS).
- PostgreSQL sensitif terhadap penamaan identifier.

---

# 4. Fitur MVP

## 4.1 Authentication & RBAC

- Login menggunakan Email dan Password.
- Role:
  - ADMIN
  - GURU
  - SISWA

---

## 4.2 Manajemen Data Master (Admin)

Admin dapat melakukan CRUD terhadap:

- Data Guru
- Data Siswa
- Data Kelas
- Tahun Ajaran
- Semester
- Data Ruangan (baru)
- Jadwal Pelajaran (baru)

---

## 4.3 Absensi via QR + Approval Guru

QR statis ditempel di masing-masing ruangan kelas. QR tidak perlu rotate — keamanan dijamin lewat validasi jadwal yang sedang aktif dan konfirmasi manual guru, bukan dari QR itu sendiri (karena QR fisik bisa saja difoto/disebar).

### Alur

1. Guru membuka sesi kelas (pilih jadwal yang sedang berlangsung) → sistem membuat `SesiAbsensi` berstatus AKTIF untuk jadwal tersebut hari itu.
2. Siswa scan QR ruangan pakai akun masing-masing saat masuk/pindah kelas.
3. Sistem memvalidasi ada sesi AKTIF di ruangan tersebut sesuai jam sekarang. Jika valid, sistem membuat catatan `AbsensiRequest` berstatus PENDING (tercentang "hadir" secara default). Jika tidak ada sesi aktif, scan ditolak otomatis.
4. Siswa melihat status real-time di app: "Menunggu konfirmasi guru".
5. Guru melihat live list siswa yang sudah scan — semua tercentang default sebagai hadir.
6. Guru **uncheck** siswa yang secara fisik tidak ada di kelas (kalau ada kejanggalan).
7. Guru klik "Konfirmasi Kehadiran" → siswa yang masih tercentang berubah status HADIR; siswa yang di-uncheck bisa langsung di-override manual jadi SAKIT/IZIN/ALPHA.
8. Status berubah real-time di app siswa.
9. Guru menutup sesi di akhir jam pelajaran → siswa yang tidak pernah scan otomatis berstatus ALPHA (masih bisa dikoreksi manual oleh guru).

### Status AbsensiRequest

- **PENDING** — sudah scan, menunggu konfirmasi guru
- **HADIR** — dikonfirmasi guru
- **SAKIT / IZIN / ALPHA** — hasil override manual guru

---

## 4.4 Riwayat Absensi

Menampilkan histori absensi setiap siswa (sumber data: `AbsensiRequest`) yang berisi:

- Tanggal & jam pelajaran
- Status
- Keterangan
- Guru yang mengonfirmasi

---

## 4.5 Rekap Absensi

Jenis rekap:

- Rekap Harian
- Rekap Bulanan
- Rekap Per Kelas

---

## 4.6 Export Laporan

Menggunakan **ExcelJS**.

Jenis laporan:

- Rekap per kelas
- Rekap per siswa
- Rekap bulanan

---

## 4.7 Dashboard

Dashboard menampilkan informasi ringkas berupa:

- Persentase kehadiran setiap kelas.
- Jumlah siswa hadir hari ini.
- Jumlah siswa sakit.
- Jumlah siswa izin.
- Jumlah siswa alpha.
- Daftar siswa dengan alpha terbanyak.
- Statistik kehadiran berdasarkan periode.
- **Monitoring Real-time Ruangan** (baru): menampilkan seluruh ruangan yang sedang ada sesi aktif, mapel & guru pengampu, serta progress kehadiran (contoh: "18/32 siswa sudah scan"). Update via polling berkala.

---

# 5. Struktur Database

## User

| Field | Keterangan |
|--------|------------|
| id | Primary Key |
| nama | Nama Guru/Admin/Siswa |
| email | Email Login |
| password_hash | Password terenkripsi |
| role | ADMIN / GURU / SISWA |

---

## Siswa

| Field | Keterangan |
|--------|------------|
| id | Primary Key |
| user_id | Relasi ke User (akun login siswa) |
| nisn | Nomor Induk Siswa Nasional |
| nama | Nama siswa |
| kelas_id | Relasi ke tabel kelas |
| nama_wali | Nama wali siswa |
| kontak_wali | Nomor HP wali |

---

## Kelas

| Field | Keterangan |
|--------|------------|
| id | Primary Key |
| nama | Nama kelas |
| wali_kelas_id | Relasi guru |
| tahun_ajaran_id | Relasi tahun ajaran |

---

## TahunAjaran

| Field | Keterangan |
|--------|------------|
| id | Primary Key |
| label | Contoh: 2026/2027 |
| semester | Ganjil / Genap |
| is_active | Tahun ajaran aktif |

---

## Ruangan

| Field | Keterangan |
|--------|------------|
| id | Primary Key |
| nama | Nama ruangan (contoh: "Kelas 9A", "Lab Komputer") |
| qr_code | Identifier statis yang di-encode ke QR yang ditempel |

---

## JadwalPelajaran

| Field | Keterangan |
|--------|------------|
| id | Primary Key |
| kelas_id | Relasi ke kelas |
| ruangan_id | Relasi ke ruangan |
| mapel | Nama mata pelajaran |
| guru_id | Relasi guru pengampu |
| hari | Hari dalam seminggu |
| jam_mulai | Jam mulai sesi |
| jam_selesai | Jam selesai sesi |

---

## SesiAbsensi

| Field | Keterangan |
|--------|------------|
| id | Primary Key |
| jadwal_id | Relasi ke jadwal pelajaran |
| tanggal | Tanggal sesi berlangsung |
| status | AKTIF / SELESAI |
| dibuka_oleh | Guru yang membuka sesi |

---

## AbsensiRequest

| Field | Keterangan |
|--------|------------|
| id | Primary Key |
| sesi_id | Relasi ke sesi absensi |
| siswa_id | Relasi siswa yang scan |
| scanned_at | Waktu scan QR |
| status | PENDING / HADIR / SAKIT / IZIN / ALPHA |
| keterangan | Catatan tambahan (opsional) |
| approved_by | Guru yang mengonfirmasi |
| approved_at | Waktu konfirmasi |

---

# 6. Flow Sistem

```text
Admin
│
├── Login
├── Kelola Guru / Siswa / Kelas / Tahun Ajaran
├── Kelola Ruangan & Jadwal Pelajaran
├── Lihat Monitoring Real-time Ruangan
└── Lihat Rekap Laporan
        │
        ▼
=========================
        Database
=========================
        ▲          ▲
        │          │
Guru                Siswa
│                    │
├── Login             ├── Login
├── Buka sesi kelas    ├── Scan QR ruangan
├── Lihat live list     ├── Lihat status real-time
│   siswa yang scan       (menunggu/hadir/ditolak)
├── Konfirmasi/uncheck  └── Lihat riwayat pribadi
├── Override manual
└── Tutup sesi
        │
        ▼
Dashboard
│
├── Statistik & Monitoring Ruangan
├── Rekap
└── Export Excel
```

---

# 7. Setup Development Environment

## 1. Install Laragon

Aktifkan service MySQL.

---

## 2. Buat Database

Misalnya:

```sql
absensi_dev
```

---

## 3. Buat Project Nuxt

```bash
npx nuxi@latest init absensi
```

---

## 4. Install Dependency

```bash
npm install
```

Install Prisma:

```bash
npm install prisma @prisma/client
npx prisma init
```

Catatan: library untuk generate & scan QR masih perlu diriset dan diinstall terpisah setelah ditentukan.

---

## 5. Konfigurasi Environment

File `.env`

```env
DATABASE_URL="mysql://root:@localhost:3306/absensi_dev"
```

---

## 6. Konfigurasi Prisma

Pada `schema.prisma`

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

---

## 7. Buat Model Prisma

Tambahkan seluruh model sesuai perencanaan di bagian 5.

Kemudian jalankan migrasi:

```bash
npx prisma migrate dev
```

---

# 8. Target MVP

- [ ] Setup Nuxt 3
- [ ] Setup Prisma
- [ ] Setup MySQL (Laragon)
- [ ] Authentication (Admin, Guru, Siswa)
- [ ] RBAC
- [ ] CRUD Guru
- [ ] CRUD Siswa (+ pembuatan akun login siswa)
- [ ] CRUD Kelas
- [ ] CRUD Tahun Ajaran
- [ ] CRUD Semester
- [ ] CRUD Ruangan
- [ ] CRUD Jadwal Pelajaran
- [ ] Generate QR statis per ruangan
- [ ] Modul Buka/Tutup Sesi Kelas (Guru)
- [ ] Modul Scan QR (Siswa)
- [ ] Modul Konfirmasi Kehadiran (Guru)
- [ ] Riwayat Absensi
- [ ] Rekap Harian
- [ ] Rekap Bulanan
- [ ] Rekap Per Kelas
- [ ] Export Excel
- [ ] Dashboard
- [ ] Monitoring Real-time Ruangan

---

# 9. Status Project

**Status saat ini:** Belum mulai coding — desain alur absensi QR + approval sudah difinalisasi.

### Yang sudah diputuskan

- ✅ Tech Stack sudah final.
- ✅ Database menggunakan MySQL.
- ✅ Menggunakan Laragon.
- ✅ Framework menggunakan Nuxt 3 + Nitro.
- ✅ ORM menggunakan Prisma.
- ✅ Siswa punya akun login sendiri (bukan lagi opsional/view-only).
- ✅ QR statis ditempel per ruangan; keamanan dari validasi jadwal + approval guru, bukan dari QR rotating.
- ✅ Approval guru pakai pola default-checked + uncheck pengecualian (bukan approve satu-satu, bukan approve massal buta).
- ✅ Ada fitur monitoring real-time ruangan (untuk Admin) selain live approval list per kelas (untuk Guru).
- ✅ Fallback siswa tanpa HP belum dipikirkan — di luar scope MVP.
- ✅ Planning fitur MVP telah selesai.

### Langkah Selanjutnya

1. Riset & pilih library QR generate + scan.
2. Membuat project Nuxt baru.
3. Setup Prisma & mendesain schema database final.
4. Membuat sistem Authentication (3 role).
5. Mengembangkan fitur CRUD data master (termasuk Ruangan & Jadwal Pelajaran).
6. Mengembangkan modul scan QR (siswa) & buka sesi (guru).
7. Mengembangkan modul approval kehadiran (guru).
8. Membuat dashboard + monitoring real-time ruangan.
9. Menambahkan fitur export laporan Excel.