<script setup lang="ts">
const { pengaturan } = usePengaturan()

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
