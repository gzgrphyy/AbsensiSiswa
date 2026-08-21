# Fix: Detail Rekap Absensi — Filter Bulan Narrowing Per-Pelajaran Stats

## Ringkasan Masalah

Pada halaman **Rekap Absensi**, detail modal per-kelas menerima filter `bulan` dari halaman utama dan menerapkannya sebagai filter server-side pada API detail. Akibatnya:

- `sesiList` hanya berisi sesi dari bulan yang difilter.
- Per-pelajaran `totalSesi` dihitung dari `sesiList` yang sudah dibatasi.
- Ketika pengguna memilih satu pelajaran (`selectedDetailMapel`) di modal, angka `totalSesi` dan daftar sesi yang ditampilkan hanya mencakup sesi dari **satu bulan**, bukan seluruh semester/kelas.

Ini adalah perilaku yang salah: detail modal seharusnya menampilkan data lengkap untuk kelas (dibatasi semester bila ada), sementara filter `bulan` hanya berlaku untuk ringkasan di halaman utama.

## Data Flow Saat Ini (yang Bermasalah)

```
Main page (app/pages/admin/rekap/index.vue)
  └─ detailQueryParams = { bulan?, semesterId? }
       └─ useFetch → /api/admin/rekap/detail/:kelasId?bulan=2026-08&semesterId=3
            └─ Server: sesiList = prisma.sesiAbsensi.findMany({ where: { tanggal: { gte, lte }, jadwal: { kelasId, semesterId } } })
                 └─ mapelSesiCount dihitung dari sesiList (hanya 1 bulan)
                      └─ Setiap siswa.pelajaran[mapel].totalSesi = mapelSesiCount.get(mapel)  ← SALAH (terlalu kecil)
```

## Rencana Perbaikan

### Langkah 1 — Hapus `bulan` dari query params detail modal

**File:** `app/pages/admin/rekap/index.vue`

Ubah `detailQueryParams` agar **tidak lagi meneruskan** `appliedBulan` ke API detail.

```ts
// Sebelum
const detailQueryParams = computed(() => ({
  ...(appliedBulan.value ? { bulan: appliedBulan.value } : {}),
  ...(appliedSemester.value ? { semesterId: appliedSemester.value } : {})
}))

// Sesudah
const detailQueryParams = computed(() => ({
  ...(appliedSemester.value ? { semesterId: appliedSemester.value } : {})
}))
```

Dengan ini, API detail hanya menerima `semesterId` (bila ada) dan `kelasId` dari route param. `sesiList` akan mengembalikan **semua sesi** untuk kelas tersebut di semester tersebut, bukan terbatas satu bulan.

### Langkah 2 — Verifikasi tidak ada efek samping

- `semesterId` tetap diteruskan → detail tetap dibatasi pada semester yang sedang aktif (jika dipilih).
- `kelasId` tetap di-route param → detail tetap spesifik ke kelas yang diklik.
- `bulan` **tetap berlaku** untuk halaman utama (`/api/admin/rekap`) → ringkasan kelas di tabel utama tetap terfilter per bulan.

### Langkah 3 — Validasi manual

1. Buka halaman Rekap Absensi.
2. Terapkan filter bulan (misal: satu bulan yang diketahui hanya punya 1 sesi pelajaran X).
3. Klik **Lihat Detail** pada salah satu kelas.
4. Di modal detail, pilih pelajaran X pada dropdown mapel.
5. Verifikasi:
   - `totalSesi` pada ringkasan sesuai jumlah sesi sebenarnya untuk pelajaran X di semester tersebut (bukan 1).
   - Tab **Riwayat Sesi Pelajaran** menampilkan semua sesi pelajaran X (bukan cuma 1).
   - Tab **Rekap per Murid** menampilkan statistik per-pelajaran yang benar.

## File Yang Berubah

| File | Perubahan |
|---|---|
| `app/pages/admin/rekap/index.vue` | Hapus `bulan` dari `detailQueryParams` (langsung edit computed property). |

## Catatan

Tidak ada migrasi data atau perubahan schema yang diperlukan. Perbaikan ini murni pada query params yang dikirim dari frontend ke API detail.

Jika di masa depan ingin menambahkan filter bulan **di dalam modal detail**, bisa dilakukan dengan:
- Menambahkan state `detailBulan` terpisah di modal (tidak memakai `appliedBulan` dari halaman utama).
- Mengirim `detailBulan` sebagai query param baru ke endpoint detail.
- Mengembalikan dua set data: `sesiList` (terfilter bulan) dan `allSesiList` (tanpa filter bulan) untuk perhitungan `totalSesi` per pelajaran.

Namun untuk perbaikan bug saat ini, cukup dengan langkah 1 di atas.
