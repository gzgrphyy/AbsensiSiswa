# Plan: Perkecil Form QR Modal di Halaman Data Ruangan

## Target File
`app/pages/admin/ruangan/index.vue`

## Masalah
Modal QR code di halaman data ruangan kepotong saat dibuka karena konten terlalu tinggi/broad untuk viewport.

## Solusi (Edit yang Diperlukan)

### 1. Outer Flex Container (baris 653)
**Ganti** `items-center` → `items-start` dan tambahkan `overflow-y-auto`:
```vue
<div v-if="showQR" class="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" @click.self="showQR = null">
```

### 2. Inner Modal Container (baris 656)
**Tambahkan** `max-h-[90vh]` dan kurangi padding:
```vue
class="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm mx-auto p-3 border border-gray-300 dark:border-gray-600 text-center overflow-y-auto max-h-[90vh]"
```

### 3. QR Preview (baris 673-675)
**Kurangi** ukuran maksimal QR agar tidak mendominasi:
```vue
<div v-else-if="qrSvg" class="flex justify-center mb-3">
  <div class="qr-preview" v-html="qrSvg" style="max-width: 180px; max-height: 180px; margin: 0 auto; overflow: hidden;"></div>
</div>
```

### 4. Loading Spinner Area (baris 667)
**Kurangi** `py-12` → `py-8` untuk loading state.

### 5. Description Text (baris 665)
**Kurangi** `mb-4` → `mb-3`.

### 6. Copy Section Padding (baris 680)
**Sudah** `p-2.5 space-y-1.5` — cukup kecil.

### 7. Print Size Selector (baris 724)
**Kurangi** `mb-4` → `mb-3`.

### 8. Copy Button Padding (baris 688, 707)
**Kurangi** `p-2` → `p-1.5`.

## Validasi
- Buka halaman admin/ruangan
- Klik tombol "QR" pada salah satu ruangan
- Pastikan modal muncul penuh tanpa terpotong
- Pastikan QR code masih terlihat
- Klik "Cetak" dan pastikan print preview muncul dengan baik

## Catatan
- Semua perubahan bersifat UI-only (CSS classes), tidak mengubah logika
- Tidak perlu build untuk melihat perubahan ini berlaku