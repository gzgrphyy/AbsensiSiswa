<script setup lang="ts">
const { user } = useUserSession()
const { fetch } = usePengaturan()

const isAdmin = computed(() => user.value?.role === 'ADMIN')

provide('isAdmin', isAdmin)

onMounted(() => {
  fetch()
})
</script>

<template>
  <div class="h-screen overflow-hidden flex flex-col bg-[#FEFEFE] dark:bg-slate-900">
    <!-- MiniNavbar: only for Admin, sits above everything -->
    <MiniNavbar v-if="isAdmin" class="flex-shrink-0" />

    <div class="flex flex-1 min-h-0 overflow-hidden">
      <!-- Sidebar -->
      <Sidebar />

      <!-- Main Area -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Header -->
        <Header class="flex-shrink-0" />

        <!-- Content -->
        <main class="flex-1 overflow-y-auto min-h-0">
          <div class="page-container">
            <slot />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
