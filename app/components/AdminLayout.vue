<script setup lang="ts">
const { fetch } = usePengaturan()

onMounted(() => {
  fetch()
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-[#FEFEFE]">
    <PrimaryNavbar />
    <SecondaryNavbar />

    <main class="flex-1 overflow-y-auto">
      <div class="page-container">
        <slot />
      </div>
    </main>
  </div>
</template>