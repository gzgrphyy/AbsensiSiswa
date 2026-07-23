# Project Planning — Sistem Absensi Siswa

## 1. Ringkasan Project

Aplikasi absensi siswa untuk sekolah yang dikembangkan sebagai project sederhana (bukan production-grade), menggunakan stack yang konsisten dengan project KosTagih/KOSFLOW agar proses development lebih cepat dan maintainable.

### Tujuan
Membantu guru dalam melakukan pencatatan absensi harian, serta memudahkan admin dalam mengelola data siswa, kelas, guru, dan menghasilkan laporan absensi.

### Prinsip Pengembangan
- Sederhana dan fungsional.
- Fokus pada kebutuhan utama sekolah.
- Mudah dikembangkan kembali di masa depan.
- Menggunakan stack yang sudah familiar agar development lebih cepat.

---

# 2. Aktor & Hak Akses

| Aktor | Hak Akses |
|--------|------------|
| **Admin** | Kelola seluruh data master (siswa, kelas, guru, tahun ajaran), melihat seluruh laporan, serta mengelola sistem. |
| **Guru / Wali Kelas** | Menginput dan mengelola absensi harian sesuai kelas yang diampu. |
| **Siswa / Orang Tua (Opsional / MVP+)** | Melihat riwayat absensi milik siswa melalui portal. |

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
| Authentication | nuxt-auth-utils | Session Authentication |
| Validation | Zod | Validasi request |
| Export Excel | ExcelJS | Pembuatan laporan Excel |

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

---

## 4.2 Manajemen Data Master (Admin)

Admin dapat melakukan CRUD terhadap:

- Data Guru
- Data Siswa
- Data Kelas
- Tahun Ajaran
- Semester

---

## 4.3 Input Absensi Harian (Guru)

### Alur

1. Guru memilih kelas.
2. Guru memilih tanggal absensi.
3. Sistem menampilkan daftar siswa pada kelas tersebut.
4. Guru memilih status setiap siswa.
5. Data disimpan ke database.

Status absensi:

- HADIR
- SAKIT
- IZIN
- ALPHA

---

## 4.4 Riwayat Absensi

Menampilkan histori absensi setiap siswa yang berisi:

- Tanggal
- Status
- Keterangan
- Guru pencatat

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

---

# 5. Struktur Database

## User

| Field | Keterangan |
|--------|------------|
| id | Primary Key |
| nama | Nama Guru/Admin |
| email | Email Login |
| password_hash | Password terenkripsi |
| role | ADMIN / GURU |

---

## Siswa

| Field | Keterangan |
|--------|------------|
| id | Primary Key |
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

## Absensi

| Field | Keterangan |
|--------|------------|
| id | Primary Key |
| siswa_id | Relasi siswa |
| kelas_id | Relasi kelas |
| tanggal | Tanggal absensi |
| status | HADIR / SAKIT / IZIN / ALPHA |
| keterangan | Catatan tambahan |
| dicatat_oleh | User guru yang melakukan input |

---

# 6. Flow Sistem

```text
Admin
│
├── Login
│
├── Kelola Guru
├── Kelola Siswa
├── Kelola Kelas
├── Kelola Tahun Ajaran
│
└── Lihat Rekap Laporan
        │
        ▼
=========================
        Database
=========================
        ▲
        │
Guru
│
├── Login
├── Pilih Kelas
├── Pilih Tanggal
├── Input Status Absensi
└── Simpan
        │
        ▼
Dashboard
│
├── Statistik
├── Rekap
└── Export Excel

(Opsional)

Siswa / Orang Tua
│
└── Melihat Riwayat Absensi
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

Tambahkan seluruh model sesuai perencanaan.

Kemudian jalankan migrasi:

```bash
npx prisma migrate dev
```

---

# 8. Target MVP

- [ ] Setup Nuxt 3
- [ ] Setup Prisma
- [ ] Setup MySQL (Laragon)
- [ ] Authentication
- [ ] RBAC
- [ ] CRUD Guru
- [ ] CRUD Siswa
- [ ] CRUD Kelas
- [ ] CRUD Tahun Ajaran
- [ ] CRUD Semester
- [ ] Input Absensi Harian
- [ ] Riwayat Absensi
- [ ] Rekap Harian
- [ ] Rekap Bulanan
- [ ] Rekap Per Kelas
- [ ] Export Excel
- [ ] Dashboard

---

# 9. Status Project

**Status saat ini:** Belum mulai coding.

### Yang sudah diputuskan

- ✅ Tech Stack sudah final.
- ✅ Database menggunakan MySQL.
- ✅ Menggunakan Laragon.
- ✅ Framework menggunakan Nuxt 3 + Nitro.
- ✅ ORM menggunakan Prisma.
- ✅ Planning fitur MVP telah selesai.

### Langkah Selanjutnya

1. Membuat project Nuxt baru.
2. Setup Prisma.
3. Mendesain schema database.
4. Membuat sistem Authentication.
5. Mengembangkan fitur CRUD data master.
6. Mengembangkan modul absensi harian.
7. Membuat dashboard.
8. Menambahkan fitur export laporan Excel.