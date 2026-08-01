<script setup lang="ts">
const route = useRoute()
const { adaSesi } = useSesiHariIni()

const scanDisabled = computed(() => adaSesi.value === false)

const items = [
  { label: 'Home', to: '/siswa', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Riwayat', to: '/siswa/riwayat', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Scan', to: '/siswa/scan', fab: true },
  { label: 'Izin', to: '/siswa/izin', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { label: 'Profil', to: '/siswa/profil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
]

function isActive(to: string) {
  return route.path === to
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-40" aria-label="Navigasi utama">
    <div class="relative max-w-lg mx-auto">
      <!-- FAB Scan QR -->
      <NuxtLink
        v-if="!scanDisabled"
        to="/siswa/scan"
        title="Scan QR Absen"
        aria-label="Scan QR Absen"
        class="absolute left-1/2 -top-8 -translate-x-1/2 z-10 focus:outline-none"
      >
        <span
          class="w-16 h-16 rounded-full bg-accent-500 text-primary-900 flex flex-col items-center justify-center gap-0.5 shadow-xl shadow-accent-500/50 ring-4 transition-transform duration-150 hover:scale-105 active:scale-95"
          :class="isActive('/siswa/scan') ? 'ring-primary-100 dark:ring-primary-900' : 'ring-white dark:ring-slate-900'"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <span class="text-[9px] font-bold leading-none">Scan</span>
        </span>
      </NuxtLink>

      <span
        v-else
        title="Belum ada sesi hari ini"
        aria-label="Belum ada sesi hari ini"
        aria-disabled="true"
        class="absolute left-1/2 -top-8 -translate-x-1/2 z-10 select-none"
      >
        <span
          class="w-16 h-16 rounded-full bg-gray-200 dark:bg-slate-600 text-gray-400 dark:text-gray-300 flex flex-col items-center justify-center gap-0.5 ring-4 ring-gray-100 dark:ring-slate-800 cursor-not-allowed"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <span class="text-[9px] font-bold leading-none">Scan</span>
        </span>
      </span>

      <!-- Bar -->
      <div class="grid grid-cols-5 bg-white/95 dark:bg-slate-800/95 backdrop-blur border-t border-gray-200 dark:border-slate-700 shadow-[0_-6px_20px_rgb(0_0_0_/_0.05)] dark:shadow-[0_-6px_20px_rgb(0_0_0_/_0.35)]">
        <template v-for="item in items" :key="item.label">
          <div v-if="item.fab" class="h-[52px]" aria-hidden="true" />
          <NuxtLink
            v-else
            :to="item.to"
            class="flex flex-col items-center justify-end gap-1 pt-2.5 h-[52px] pb-[calc(0.375rem+env(safe-area-inset-bottom))] active:bg-gray-50 dark:active:bg-slate-700/50 transition-colors"
          >
            <span
              class="w-9 h-6 flex items-center justify-center rounded-full"
              :class="isActive(item.to) ? 'bg-primary-50 dark:bg-primary-900/40' : ''"
            >
              <svg
                class="w-5 h-5"
                :class="isActive(item.to) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" :d="item.icon" />
              </svg>
            </span>
            <span class="text-[10px] leading-none" :class="isActive(item.to) ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-gray-400 dark:text-gray-500'">
              {{ item.label }}
            </span>
          </NuxtLink>
        </template>
      </div>
    </div>
  </nav>
</template>
