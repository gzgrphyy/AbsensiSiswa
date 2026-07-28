<script setup lang="ts">
const { user } = useUserSession()
const { fetch } = usePengaturan()

const isAdmin = computed(() => user.value?.role === 'ADMIN')

// Fetch pengaturan data once for global state
onMounted(() => {
  fetch()
})
</script>

<template>
  <div class="flex min-h-screen bg-[#FEFEFE]">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <Header />

      <!-- Content -->
      <main class="flex-1 overflow-y-auto">
        <div class="page-container">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
