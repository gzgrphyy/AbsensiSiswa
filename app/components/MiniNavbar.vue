<script setup lang="ts">
const { pengaturan } = usePengaturan()
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
  <header class="bg-gray-900 text-white flex-shrink-0">
    <div class="px-3 sm:px-4">
      <div class="flex items-center justify-between h-[26px]">
        <!-- Left: Compact Branding -->
        <NuxtLink to="/admin" class="flex items-center gap-1.5 min-w-0">
          <div class="w-4 h-4 rounded bg-primary-500 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 overflow-hidden">
            <img v-if="pengaturan?.iconPath" :src="pengaturan.iconPath" class="w-full h-full object-contain" />
            <span v-else>{{ pengaturan?.namaAplikasi?.charAt(0) || 'S' }}</span>
          </div>
          <span class="text-[10px] font-medium text-gray-200 truncate hidden sm:inline">{{ pengaturan?.namaAplikasi || 'Aplikasi Skoria' }}</span>
        </NuxtLink>

        <!-- Center: Date -->
        <div class="hidden md:flex items-center">
          <span class="text-[9px] text-gray-400 tracking-wide">{{ today }}</span>
        </div>

        <!-- Right: User info compact -->
        <div class="flex items-center gap-1.5">
          <div class="flex items-center gap-1">
            <div class="w-4 h-4 rounded-full bg-primary-600 flex items-center justify-center text-[8px] font-semibold text-white border border-primary-400">
              {{ user?.nama?.charAt(0)?.toUpperCase() || 'U' }}
            </div>
            <span class="text-[9px] text-gray-300 hidden sm:inline truncate max-w-[80px]">{{ user?.nama || 'User' }}</span>
            <span class="text-[8px] text-gray-500 hidden lg:inline">• {{ roleLabel[user?.role] || user?.role }}</span>
          </div>
          <div class="h-2.5 w-px bg-gray-700" />
          <button @click="handleLogout"
            class="inline-flex items-center gap-0.5 px-1 py-0.5 text-[9px] font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-all duration-150"
            title="Logout">
            <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
