# Plan: Perbaiki Posisi dan Visibilitas QR Modal di Halaman Data Ruangan

## Target File
`app/pages/admin/ruangan/index.vue`

## Masalah Saat Ini
Setelah perubahan sebelumnya, terdapat 2 masalah baru:
1. QR code tidak muncul ("gada qr nya")
2. Form berada di posisi atas layar, bukan di tengah ("harusnya pas di tengah halaman")

## Analisis
- `items-start` pada outer container menyebabkan modal menempel di atas
- `overflow: hidden` pada QR preview menyebabkan SVG terpotong/tak terlihat
- Layout harus tetap centered tapi scrollable

## Solusi (Edit yang Diperlukan)

### 1. Outer Flex Container (baris 653)
**Ganti kembali** `items-start` → `items-center` agar modal tetap berada di tengah vertikal, pertahankan `overflow-y-auto`:
```vue
<div v-if="showQR" class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" @click.self="showQR = null">
```

### 2. Inner Modal Container (baris 656)
**Kurangi** padding `p-4` → `p-3`, **hapus** `max-h` agar tidak menyebabkan clip:
```vue
class="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm mx-auto p-3 border border-gray-300 dark:border-gray-600 text-center overflow-y-auto"
```

### 3. Loading Spinner (baris 667)
**Kurangi** `py-12` → `py-8`:
```vue
<div v-if="loadingQR" class="py-8 flex justify-center">
```

### 4. QR Preview (baris 673-675)
**Hapus** `overflow: hidden` dan `max-height`, hanya gunakan `max-width` untuk membatasi lebar, biarkan SVG menyesuaikan dengan lebar container:
```vue
<div v-else-if="qrSvg" class="flex justify-center mb-3">
  <div class="qr-preview" v-html="qrSvg" style="max-width: 200px; margin: 0 auto;"></div>
</div>
```

### 5. Semua `mb-4` → `mb-3`
- Baris 665: `mb-4` → `mb-3` (description text)
- Baris 724: `mb-4` → `mb-3` (print size selector wrapper)

### 6. Copy button padding (baris 688, 707)
**Kurangi** `p-2` → `p-1.5` pada tombol copy.

## Validasi
1. Buka halaman admin/ruangan
2. Klik tombol QR pada salah satu ruangan
3. Pastikan:
   - Modal muncul **di tengah halaman** (centered)
   - **QR code terlihat** (tidak tersembunyi)
   - Seluruh konten modal terlihat tanpa terpotong
   - Scroll tersedia jika konten melebihi tinggi layar
4. Klik tombol "Cetak" dan verifikasi print preview

## Catatan
- Hindari `overflow: hidden` pada elemen yang berisi SVG yang di-render via `v-html`
- Gunakan `items-center` pada flex container untuk centering, dengan `overflow-y-auto` pada outer container agar tetap scrollable saat konten panjang
- Perubahan ini hanya CSS/UI, tidak mengubah logika aplikasi
