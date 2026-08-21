# Plan: Tampilkan QR Code Image di Modal QR Ruangan

## Target File
`app/pages/admin/ruangan/index.vue`

## Masalah Saat Ini
Semua layout sudah benar, tapi modal QR hanya menampilkan **teks kode QR** (R-030), tidak menampilkan **gambar QR code** itu sendiri. Pengguna butuh gambar QR agar bisa discan secara visual.

## Analisis
- Bagian `v-html="qrSvg"` seharusnya sudah menampilkan SVG QR dari API
- Kemungkinan SVG tidak terlihat karena:
  1. SVG dari `uqr` memiliki `width`/`height` eksplisit sehingga tidak responsive
  2. Tidak ada CSS yang memaksa SVG mengisi container preview
  3. Container preview hanya dibatasi `max-width` tanpa dimensi eksplisit

## Solusi (Edit yang Diperlukan)

### 1. QR Preview Container (baris 673-675)
**Ganti** styling inline dengan class yang eksplisit dan tambahkan CSS untuk membuat SVG responsive:
```vue
<div v-else-if="qrSvg" class="flex justify-center mb-3">
  <div class="qr-preview" v-html="qrSvg" style="width: 200px; height: 200px; margin: 0 auto;"></div>
</div>
```

### 2. Tambahkan CSS untuk `.qr-preview` di bagian `<style scoped>` (akhir file)
Agar SVG dari `uqr` yang memiliki width/height eksplisit tetap responsif:
```css
.qr-preview svg {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain;
}
```

### 3. Opsional: Tambahkan background ringan pada QR preview agar terlihat jelas
```css
.qr-preview {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## Validasi
1. Buka halaman admin/ruangan
2. Klik tombol QR pada salah satu ruangan
3. Pastikan:
   - Modal muncul **di tengah halaman**
   - **Gambar QR code terlihat** (tidak hanya teks R-030)
   - QR code memiliki ukuran yang jelas dan bisa discan
   - Teks kode QR dan URL tetap terlihat di bawah gambar QR
4. Test di mobile viewport jika perlu

## Catatan
- Perubahan ini hanya menambahkan CSS styling untuk memastikan SVG QR benar-benar terrender dan terlihat
- Tidak mengubah logika pengambilan data atau API
- Ukuran 200x200px dipilih agar cukup besar untuk discan tapi tidak terlalu dominan di modal
