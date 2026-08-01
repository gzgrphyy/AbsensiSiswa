<script setup lang="ts">
const { pengaturan } = usePengaturan()

// Apply brand color (warna utama) from pengaturan
watch(pengaturan, (val) => {
  if (val?.warnaUtama) {
    applyPrimaryColor(val.warnaUtama)
  }
}, { immediate: true })

// Dynamic favicon based on pengaturan
useHead({
  link: computed(() => {
    const favicon = pengaturan.value?.faviconPath
    if (favicon) {
      return [
        { rel: 'icon', type: 'image/x-icon', href: favicon },
        { rel: 'shortcut icon', type: 'image/x-icon', href: favicon }
      ]
    }
    return []
  }),
  title: computed(() => pengaturan.value?.titelAplikasi || 'Sistem Absensi')
})
</script>

<template>
  <NuxtPage />
</template>
