<script setup lang="ts">
const { clear } = useUserSession()
const { pengaturan } = usePengaturan()
const colorMode = useColorMode()
const isAdmin = inject('isAdmin', false)

const isDark = computed(() => colorMode.value === 'dark')

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const today = new Date().toLocaleDateString('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

async function handleLogout() {
  try { await clear() } catch {}
  navigateTo('/login')
}
</script>

<template>
  <header class="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
    <!-- Garis primary di paling atas -->
    <div class="h-0.5 bg-primary-500" />

    <div class="px-6 py-2.5 flex items-center justify-between">
      <!-- Left: Logo & School Name (Admin only) -->
      <NuxtLink v-if="isAdmin" to="/admin" class="flex items-center gap-2.5 min-w-0 flex-shrink-0">
        <div class="w-9 h-9 bg-primary-500 flex items-center justify-center text-white text-sm  overflow-hidden flex-shrink-0 rounded-full">
          <img v-if="pengaturan?.logoSekolahPath" :src="pengaturan.logoSekolahPath" class="w-full h-full object-contain p-1" />
          <span v-else class="text-[10px]  text-center leading-tight px-1">SMK</span>
        </div>
        <div class="min-w-0 hidden md:block">
          <p class="text-sm  text-gray-900 dark:text-gray-100 truncate leading-tight">{{ pengaturan?.namaSekolah || 'SMK Negeri 1 Bandung' }}</p>
          <p class="text-[10px] text-gray-400 dark:text-gray-500 truncate leading-tight">{{ pengaturan?.titelAplikasi || 'Sistem Absensi' }}</p>
        </div>
      </NuxtLink>

      <!-- Right: User Info -->
      <div class="flex items-center gap-3">
        <span class="text-[11px] text-gray-400 dark:text-gray-500 hidden md:block">{{ today }}</span>
        <div class="h-4 w-px bg-gray-200 dark:bg-slate-700 hidden md:block" />

        <!-- Theme Toggle -->
        <button
          @click="toggleColorMode"
          :class="['p-1.5 text-gray-400 dark:text-gray-500 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-150', isAdmin ? 'rounded-none' : 'rounded-lg']"
          :title="isDark ? 'Mode Terang' : 'Mode Gelap'"
        >
          <!-- Sun icon (show in dark mode) -->
          <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <!-- Moon icon (show in light mode) -->
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <div class="flex items-center gap-2.5">
          <div v-if="pengaturan?.iconPath" class="w-8 h-8 bg-primary-500 rounded-full overflow-hidden border border-primary-100 dark:border-primary-800 flex-shrink-0 flex items-center justify-center">
            <img :src="pengaturan.iconPath" class="w-full h-full object-contain p-1" />
          </div>
          <div v-else class="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center text-xs  text-primary-600 dark:text-primary-300 border border-primary-100 dark:border-primary-800 flex-shrink-0">
            {{ pengaturan?.namaAplikasi?.charAt(0)?.toUpperCase() || 'S' }}
          </div>
          <div class="hidden md:block">
            <p class="text-sm  text-gray-900 dark:text-gray-100 leading-tight">{{ pengaturan?.namaAplikasi || 'Aplikasi Skoria' }}</p>
            <p class="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">{{ pengaturan?.titelAplikasi || 'Sistem Absensi' }}</p>
          </div>
        </div>

        <button
          @click="handleLogout"
          :class="['inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs  text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all duration-150', isAdmin ? 'rounded-none' : 'rounded-lg']"
          title="Keluar"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </div>
  </header>
</template>
