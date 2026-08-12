<script setup lang="ts">
const { clear } = useUserSession()
const { pengaturan } = usePengaturan()
const { t, locale } = useI18n()
const isAdmin = inject('isAdmin', false)

const today = computed(() => new Date().toLocaleDateString(locale.value === 'en' ? 'en-GB' : 'id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}))

const now = ref(new Date())
let clockTimer: ReturnType<typeof setInterval> | null = null

const currentTime = computed(() =>
  now.value.toLocaleTimeString(locale.value === 'en' ? 'en-GB' : 'id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
)

onMounted(() => {
  clockTimer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})

async function handleLogout() {
  try { await clear() } catch {}
  navigateTo('/login')
}
</script>

<template>
  <header class="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
    <!-- Garis merah putih di paling atas (fixed, tidak ikut warna utama) -->
    <div class="flex flex-col">
      <div class="h-0.5 bg-red-600" />
      <div class="h-0.5 bg-white border-b border-gray-200 dark:border-slate-700" />
    </div>

    <div class="px-6 py-2.5 flex items-center justify-between">
      <!-- Left: Logo & School Name (Admin only) -->
      <NuxtLink v-if="isAdmin" to="/admin" class="flex items-center gap-2.5 min-w-0 flex-shrink-0">
        <div class="w-9 h-9 bg-[#e8ecf1] flex items-center justify-center text-white text-sm  overflow-hidden flex-shrink-0 rounded-full">
          <img v-if="pengaturan?.logoSekolahPath" :src="pengaturan.logoSekolahPath" class="w-full h-full object-contain p-1" />
          <span v-else class="text-[10px]  text-center leading-tight px-1">SMK</span>
        </div>
        <div class="min-w-0 hidden md:block">
          <p class="text-sm  text-gray-900 dark:text-gray-100 truncate leading-tight">{{ pengaturan?.namaSekolah || 'SMK Negeri 4 Bandung' }}</p>
          <p class="text-[10px] text-gray-400 dark:text-gray-500 truncate leading-tight">{{ t('app.sistemAbsensi') }}</p>
        </div>
      </NuxtLink>

      <!-- Right: User Info -->
      <div class="flex items-center gap-3">
        <div class="hidden md:block leading-tight">
          <p class="text-[11px] text-gray-400 dark:text-gray-500">{{ today }}</p>
          <p class="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums tracking-wide">{{ currentTime }}</p>
        </div>
        <!-- Theme Toggle -->
        <div class="h-6 w-px bg-gray-200 dark:bg-slate-700 hidden md:block" />

        <div class="flex items-center gap-2.5">
          <div v-if="pengaturan?.iconPath" class="w-8 h-8 bg-[#e8ecf1] rounded-full overflow-hidden border border-primary-100 dark:border-primary-800 flex-shrink-0 flex items-center justify-center">
            <img :src="pengaturan.iconPath" class="w-full h-full object-contain p-1" />
          </div>
          <div v-else class="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center text-xs  text-primary-600 dark:text-primary-300 border border-primary-100 dark:border-primary-800 flex-shrink-0">
            {{ t('app.aplikasiSkoria').charAt(0).toUpperCase() }}
          </div>
          <div class="hidden md:block">
            <p class="text-sm  text-gray-900 dark:text-gray-100 leading-tight">{{ t('app.aplikasiSkoria') }}</p>
            <p class="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">{{ t('app.sistemAbsensi') }}</p>
          </div>
        </div>

        <button
          @click="handleLogout"
          :class="['inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs  text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all duration-150', isAdmin ? 'rounded-md' : 'rounded-lg']"
          :title="t('common.keluar')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="hidden sm:inline">{{ t('common.keluar') }}</span>
        </button>
      </div>
    </div>
  </header>
</template>
