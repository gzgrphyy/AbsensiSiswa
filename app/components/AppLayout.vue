<script setup lang="ts">
const { user } = useUserSession()

const isAdmin = computed(() => user.value?.role === 'ADMIN')
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <Header />

      <!-- Content -->
      <main class="flex-1 bg-gray-50 overflow-y-auto">
        <div class="page-container">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
