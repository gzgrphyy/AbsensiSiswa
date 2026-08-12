<script setup lang="ts">
const { pengaturan } = usePengaturan()
const { t } = useI18n()

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
  title: computed(() => `${t('app.aplikasiSkoria')} | ${t('app.sistemAbsensi')}`)
})
</script>

<template>
  <NuxtPage />
</template>
