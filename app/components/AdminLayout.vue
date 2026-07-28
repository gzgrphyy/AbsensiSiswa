<script setup lang="ts">
import { provide } from 'vue'

const { fetch } = usePengaturan()

provide('isAdmin', true)

onMounted(() => {
  fetch()
})
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden bg-white dark:bg-slate-900">
    <MiniNavbar class="flex-shrink-0" />
    <PrimaryNavbar class="flex-shrink-0" />
    <SecondaryNavbar class="flex-shrink-0" />

    <main class="flex-1 overflow-y-auto min-h-0">
      <Letterhead />
      <div class="page-container-admin">
        <slot />
      </div>
      <AdminFooter />
    </main>
  </div>
</template>