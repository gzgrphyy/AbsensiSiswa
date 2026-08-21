# Plan: Redesign Admin Rekap Absensi Detail Modal

## Goal
Hapus kesan "template/dashboard generik" di modal detail rekap absensi admin dengan 6 perubahan visual berkoordinasi, tanpa mengubah data/logika yang sudah ada.

## File Target
- `app/pages/admin/rekap/index.vue` — satu file saja, perubahan terpusat di `<BaseModal>` (line 514–812).

---

## Perubahan

### 1. Inline Stat Row (bukan 4 card terpisah)
**Lokasi:** line 612–629 (4 card status Hadir/Sakit/Izin/Alpha)

- Ganti `grid grid-cols-4 gap-2.5` + 4 div card menjadi satu baris inline flex dengan 4 item.
- Setiap item: angka besar (`text-2xl font-bold text-gray-900 dark:text-gray-100`), label kecil (`text-[11px] text-gray-500 dark:text-gray-400`).
- **Warna:** Hadir/Sakit/Izin/Pending = netral (tidak ada warna). **Alpha** saja pakai accent color (`text-red-600 dark:text-red-400` atau CSS var admin-accent-red) untuk menandai butuh action.
- Pindahkan `activeSummary.totalPending` ke dalam baris ini sebagai item ke-5 (atau ke-4 menggantikan salah satu — user bisa pilih, default: Hadir, Sakit, Izin, Alpha, Pending sebagai 5 item inline).

### 2. Hapus Color-Coding Berlebihan di Tabel Murid
**Lokasi:** line 696–754 (tabel tab "Murid")

- **thead** (line 702–707): Ganti `text-green-600`, `text-amber-600`, `text-blue-600`, `text-red-600` → `text-gray-600 dark:text-gray-300`.
- **tbody angka** (line 724–727): Ganti semua warna per-kolom → `text-gray-700 dark:text-gray-300`. Hilangkan `font-bold`/`font-medium` per-kolom.
- **Conditional row highlight:** Tambah class kondisional pada `<tr>`: jika `s.alpha > 0`, tambahkan `bg-red-50/50 dark:bg-red-950/20` (atau `border-l-2 border-l-red-400`).
- Kolom Pending (line 728): tetap netral `text-gray-500`.

### 3. Hapus Avatar Inisial dari Tabel Murid
**Lokasi:** line 713–722 (div avatar bulat biru)

- Hapus seluruh `<div class="w-6 h-6 rounded-full bg-blue-100...">{{ s.nama.substring(0,1) }}</div>`.
- Tampilkan nama + NISN tanpa avatar:
  ```
  <div>
    <span class="font-medium text-gray-900 dark:text-gray-100">{{ s.nama }}</span>
    <span class="block text-[10px] text-gray-400 dark:text-gray-500">{{ s.nisn }}</span>
  </div>
  ```

### 4. Ganti Progress Bar % Kehadiran jadi Hanya Teks
**Lokasi:** line 729–745 (kolom % Kehadiran)

- Hapus seluruh `<div class="w-16 h-1.5 bg-gray-200...">` (progress bar).
- Tinggal satu `<span>` dengan teks `s.persentase%` + warna threshold:
  - `>= 80%` → `text-green-600 dark:text-green-400`
  - `>= 50%` → `text-amber-600 dark:text-amber-400`
  - `< 50%` → `text-red-600 dark:text-red-400`
- Tambah `font-bold` pada span.

### 5. Gabung Info Kelas + Filter Indicator jadi Satu Section
**Lokasi:** line 526–609 (header info card + blue filter banner)

- **Hapus** blue filter banner terpisah (line 588–609).
- **Pindahkan** filter indicator (selected mapel + reset button) ke **dalam** header info card sebagai baris kedua di bawah info dasar, dengan divider tipis (`border-t border-gray-200/60 dark:border-slate-600/60`) dan padding lebih kecil.
- Struktur baru header card:
  ```
  [Icon Kelas] [Nama + Semester]          [Link Buka Halaman]
  [Wali • Total Murid • Total Sesi]
  ── divider tipis ──
  [Info icon] Sedang melihat: SEMUA MAPEL / [Mapel X] [Reset]
  ```
- Hapus wrapper `space-y-3.5` pada modal body, ganti dengan divider antar section yang lebih longgar.

### 6. Konsisten Border Radius + Focus Ring Accent Color
**Lokasi:** line 663–691 (select mapel + search input), juga line 357–381 (filter select di luar modal)

- Ganti semua `focus:ring-blue-500 focus:border-blue-500` → `focus:ring-[rgb(var(--admin-accent))] focus:border-[rgb(var(--admin-accent))]` (atau pakai class custom `.admin-accent-ring` jika dibuat di CSS).
- Ganti `rounded-xl` pada input/search → `rounded-lg` (konsisten dengan admin pattern: 8–10px).
- Pastikan radius konsisten: semua input/select di halaman ini pakai `rounded-lg`.

---

## Validasi

1. **Visual check:** Modal detail harus terasa lebih "flat" — satu header info card, satu inline stat row, dua tab konten tanpa nested card berlebihan.
2. **Dark mode:** Semua perubahan harus punya counterpart `dark:` class.
3. **Alpha highlight kondisional:** Test dengan data yang punya alpha > 0 vs alpha = 0.
4. **Responsif:** Inline stat row harus wrap gracefully di layar kecil (gunakan `flex-wrap`).
5. **Accessibility:** Focus ring harus tetap visible, cukup pakai admin-accent color.

---

## Out of Scope
- Perubahan pada halaman utama rekap (table luar modal) — user hanya menyebutkan "bagian detail rekap absensi".
- Perubahan komponen shared (StatCard, BaseCard, BaseBadge) — perubahan hanya di template usage.
- Perubahan API atau data structure.

---

## Catatan Implementasi
- Semua perubahan di satu file: `app/pages/admin/rekap/index.vue`.
- Tidak ada dependency baru — hanya Tailwind class replacement.
- Pastikan tidak merusak `activeSummary` computed logic (tetap sama).
