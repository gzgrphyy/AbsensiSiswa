# Hapus Icon/Logo Kelas di Detail Rekap

## Lokasi
`app/pages/admin/rekap/index.vue` — bagian Header Info Card modal detail (baris 527–530).

## Perubahan
Hapus elemen icon yang menampilkan 3 hur pertama nama kelas:

```html
<!-- HAPUS blok ini -->
<div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-base flex-shrink-0">
  {{ detailData.kelas.nama.substring(0, 3) }}
</div>
```

Sesuaikan wrapper: dari `<div class="flex items-center gap-3">` menjadi `<div>` (tanpa gap-3), karena tidak ada elemen icon lagi.

Hasil akhir Header Info Card:
- H3: nama kelas + semester/tahun ajaran
- P: wali kelas • total murid • total sesi
- Tombol "Buka Halaman Kelas" tetap di kanan

## Validasi
- Buka detail rekap kelas → icon tidak muncul
- Teks nama kelas tetap normal
- Tombol "Buka Halaman Kelas" tetap bisa diklik (same tab)
