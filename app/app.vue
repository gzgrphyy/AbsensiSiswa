<script setup lang="ts">
const { pengaturan } = usePengaturan()
const { t } = useI18n()

// Apply brand color (warna utama) from pengaturan
watch(pengaturan, (val) => {
  if (val?.warnaUtama) {
    applyPrimaryColor(val.warnaUtama)
  }
}, { immediate: true })

// Dynamic favicon based on pengaturan.
// Dipasang lewat /favicon.svg (SVG dengan gambar disisipkan base64, route public)
// supaya tampil penuh & tegas di tab browser seperti Telegram,
// bukan menyusut jadi ikon 16px yang kecil.
const faviconLinks = computed(() => {
  const favicon = pengaturan.value?.faviconPath
  if (!favicon) return []

  // Cache-busting: URL /favicon.svg selalu sama, padahal isi SVG mengikuti favicon terbaru
  // (dan route-nya mengirim Cache-Control max-age 1 hari). Nama file favicon unik berisi
  // timestamp, jadi dipakai sebagai query ?v= supaya browser mengambil ulang SVG
  // begitu favicon diganti di halaman Pengaturan — tanpa harus hard refresh / tunggu cache.
  const version = favicon.split('/').pop() || 'v'

  return [
    { rel: 'icon', type: 'image/svg+xml', href: `/favicon.svg?v=${version}`, sizes: 'any' },
    { rel: 'icon', href: favicon },
    { rel: 'apple-touch-icon', href: favicon, sizes: '180x180' }
  ]
})

useHead({
  link: faviconLinks,
  title: computed(() => `${t('app.aplikasiSkoria')} | ${t('app.sistemAbsensi')}`)
})
</script>

<template>
  <NuxtPage />
</template>
