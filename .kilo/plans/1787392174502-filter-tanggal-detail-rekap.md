# Plan: Tambah Filter Tanggal di Detail Rekap Absensi Admin

## Tujuan
Tambahkan filter tanggal di bagian detail rekap absensi (modal detail) agar filter mapel bisa dikombinasikan dengan tanggal tertentu — bukan hanya mapel saja.

## Konteks Saat Ini
- Modal detail rekap dibuka dari `app/pages/admin/rekap/index.vue`
- API detail: `server/api/admin/rekap/detail/[kelasId].get.ts`
- Filter mapel saat ini **hanya client-side** (`selectedDetailMapel`) terhadap data `sesi` yang sudah di-fetch
- API detail menerima query `bulan` (bulan dari filter utama halaman) dan `semesterId`
- Di dalam modal, `daftarMapel`, `siswa`, dan `sesi` sudah diagregasi dari `sesiList` yang difilter oleh `bulan` + `semesterId`

## Rancangan

### 1. State & Query Params (Vue)
- Tambah `selectedDetailTanggal` (`ref<string>('')`, format `YYYY-MM-DD`)
- Tambah ke `detailQueryParams` agar dikirim ke API saat modal dibuka / tanggal berubah
- Reset `selectedDetailTanggal` di `openDetailModal()` bersamaan dengan reset `selectedDetailMapel`

### 2. Template (Vue)
- Tambah `<input type="date">` di sebelah dropdown mapel (lines ~660–669)
- Update filter indicator (lines 583–603) agar menampilkan:
  - "Sedang melihat semua" jika tidak ada filter
  - "Sedang melihat mapel X" jika hanya mapel terpilih
  - "Sedang melihat mapel X pada tanggal Y" jika mapel + tanggal terpilih
  - "Sedang melihat tanggal Y" jika hanya tanggal terpilih
- Tambah tombol reset untuk filter tanggal

### 3. API (`detail/[kelasId].get.ts`)
- Tambah `tanggal: z.string().optional()` ke `querySchema`
- Saat `query.tanggal` ada, filter `sesiAbsensi` dengan `{ tanggal: { equals: query.tanggal } }` (Prisma `Date` column, kirim sebagai `YYYY-MM-DD` dan Prisma akan cocokkan)
- Hasil `daftarMapel` otomatis menyesuaikan karena didirikan dari `sesiList` yang sudah terfilter

### 4. Computed Properties (Vue)
- `activeSummary` dan `filteredDetailSiswa` sudah memakai `detailData.value.sesi` dan `detailData.value.siswa`
- Karena API mengembalikan data yang sudah terfilter tanggal, computed properties tidak perlu diubah — cukup pastikan `sesiMapel` di `activeSummary` tetap memakai `detailData.value.sesi` (yang sudah terfilter tanggal oleh API)

## File yang Akan Diubah
1. `app/pages/admin/rekap/index.vue`
   - Tambah state `selectedDetailTanggal`
   - Update `detailQueryParams`
   - Update `openDetailModal`
   - Tambah input date di template
   - Update filter indicator text
2. `server/api/admin/rekap/detail/[kelasId].get.ts`
   - Update `querySchema`
   - Tambah filter tanggal pada Prisma query

## Validasi
- Buka detail rekap kelas, pastikan `daftarMapel` berubah sesuai tanggal yang dipilih
- Pilih mapel + tanggal, pastikan ringkasan (hadir/sakit/izin/alpha/pending) sesuai sesi yang difilter
- Reset filter tanggal dan mapel kembali ke semula
- Cek dark mode styling date input konsisten dengan input lain di halaman
