<script setup lang="ts">
const { fetch } = usePengaturan()

onMounted(() => {
  fetch()
})
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden bg-[#FEFEFE] dark:bg-slate-900">
    <MiniNavbar class="flex-shrink-0" />
    <PrimaryNavbar class="flex-shrink-0" />
    <SecondaryNavbar class="flex-shrink-0" />

    <main class="flex-1 overflow-y-auto min-h-0">
      <div class="page-container">
        <slot />
      </div>
    </main>
  </div>
</template>