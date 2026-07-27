<script setup lang="ts">
const { user, clear } = useUserSession()

const today = new Date().toLocaleDateString('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

const roleLabel: Record<string, string> = {
  ADMIN: 'Administrator',
  GURU: 'Guru',
  SISWA: 'Siswa'
}

async function handleLogout() {
  try { await clear() } catch {}
  navigateTo('/login')
}
</script>

<template>
  <header class="bg-white border-b border-gray-200 flex-shrink-0">
    <!-- Garis primary di paling atas -->
    <div class="h-0.5 bg-primary-500" />

    <div class="px-6 py-2.5 flex items-center justify-between">
      <!-- Left: Breadcrumb-style info -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            S
          </div>
          <div class="hidden sm:block">
            <h1 class="text-sm font-semibold text-gray-900 leading-tight">Sistem Absensi</h1>
            <p class="text-[10px] text-gray-400 leading-tight">SMKN 4 Bandung</p>
          </div>
        </div>
      </div>

      <!-- Right: User Info -->
      <div class="flex items-center gap-3">
        <span class="text-[11px] text-gray-400 hidden md:block">{{ today }}</span>
        <div class="h-4 w-px bg-gray-200 hidden md:block" />

        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-xs font-semibold text-primary-600 border border-primary-100">
            {{ user?.nama?.charAt(0)?.toUpperCase() || 'U' }}
          </div>
          <div class="hidden md:block">
            <p class="text-sm font-medium text-gray-900 leading-tight">{{ user?.nama || 'User' }}</p>
            <p class="text-[10px] text-gray-400 leading-tight">{{ roleLabel[user?.role] || user?.role }}</p>
          </div>
        </div>

        <button
          @click="handleLogout"
          class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-150"
          title="Logout"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  </header>
</template>
