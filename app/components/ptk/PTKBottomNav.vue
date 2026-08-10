<script setup lang="ts">
const route = useRoute()

interface JadwalHariIni {
  id: number
  jamMulai: string
  jamSelesai: string
  isWithinTime: boolean
  activeSesi: { id: number; status: string } | null
  todaySesi: { id: number; status: string } | null
}

const { adaJadwal, data: jadwalList, refresh } = useJadwalHariIni()

const opening = ref(false)
const fabError = ref('')
let errorTimer: ReturnType<typeof setTimeout> | null = null

const disabled = computed(() => adaJadwal.value === false)

const openableJadwal = computed(() => (jadwalList.value || []).filter(j => !j.todaySesi))

const targetJadwal = computed<JadwalHariIni | null>(() => {
  const openable = openableJadwal.value
  if (openable.length === 0) return null
  const within = openable.find(j => j.isWithinTime)
  if (within) return within
  return [...openable].sort((a, b) => a.jamMulai.localeCompare(b.jamMulai))[0]
})

const activeSesi = computed<JadwalHariIni | null>(
  () => (jadwalList.value || []).find(j => j.activeSesi) || null
)

function showError(msg: string) {
  if (errorTimer) clearTimeout(errorTimer)
  fabError.value = msg
  errorTimer = setTimeout(() => { fabError.value = '' }, 4000)
}

async function bukaSesiDariFab() {
  if (opening.value) return
  const target = targetJadwal.value
  if (!target) {
    const aktif = activeSesi.value
    if (aktif?.activeSesi) {
      await navigateTo(`/absensi/sesi/${aktif.activeSesi.id}`)
    } else {
      const ada = jadwalList.value?.length || 0
      showError(ada > 0 ? 'Semua sesi hari ini sudah dibuka.' : 'Tidak ada jadwal hari ini.')
    }
    return
  }

  opening.value = true
  try {
    const sesi = await $fetch<{ id: number }>('/api/absensi/sesi/buka', {
      method: 'POST',
      body: { jadwalId: target.id }
    })
    refresh()
    await navigateTo(`/absensi/sesi/${sesi.id}`)
  } catch (err: any) {
    showError(err?.data?.statusMessage || 'Gagal membuka sesi')
  } finally {
    opening.value = false
  }
}

const items = [
  { label: 'Beranda', to: '/absensi', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Riwayat', to: '/absensi/riwayat', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Buka Sesi', to: '/absensi', fab: true },
  { label: 'Rekap', to: '/absensi/rekap', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { label: 'Profil', to: '/absensi/profil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
]

function isActive(to: string) {
  return route.path === to
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-40" aria-label="Navigasi utama">
    <div class="relative max-w-lg mx-auto">
      <!-- Pesan transien dari aksi FAB -->
      <Transition name="slide">
        <div
          v-if="fabError"
          class="absolute left-1/2 -translate-x-1/2 -top-28 z-20 px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 text-xs font-medium shadow-lg dark:shadow-dark-card whitespace-nowrap"
        >
          {{ fabError }}
        </div>
      </Transition>

      <!-- FAB Buka Sesi -->
      <button
        v-if="!disabled"
        @click="bukaSesiDariFab"
        :disabled="opening"
        title="Buka Sesi Kelas"
        aria-label="Buka Sesi Kelas"
        class="absolute left-1/2 -top-8 -translate-x-1/2 z-10 focus:outline-none disabled:cursor-wait"
      >
        <span
          class="w-16 h-16 rounded-full bg-accent-500 text-primary-900 flex flex-col items-center justify-center gap-0.5 shadow-xl shadow-accent-500/50 ring-4 transition-transform duration-150 hover:scale-105 active:scale-95 disabled:hover:scale-100"
          :class="isActive('/absensi') ? 'ring-primary-100 dark:ring-primary-900' : 'ring-white dark:ring-slate-900'"
        >
          <svg v-if="opening" class="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <template v-else>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-[9px] font-bold leading-none">Buka Sesi</span>
          </template>
        </span>
      </button>

      <span
        v-else
        title="Belum ada jadwal hari ini"
        aria-label="Belum ada jadwal hari ini"
        aria-disabled="true"
        class="absolute left-1/2 -top-8 -translate-x-1/2 z-10 select-none"
      >
        <span
          class="w-16 h-16 rounded-full bg-gray-200 dark:bg-slate-600 text-gray-400 dark:text-gray-300 flex flex-col items-center justify-center gap-0.5 ring-4 ring-gray-100 dark:ring-slate-800 cursor-not-allowed"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="text-[9px] font-bold leading-none">Buka Sesi</span>
        </span>
      </span>

      <!-- Bar -->
      <div class="grid grid-cols-5 bg-white/95 dark:bg-slate-800/95 backdrop-blur border-t border-gray-200 dark:border-slate-700 shadow-[0_-6px_20px_rgb(0_0_0_/_0.05)] dark:shadow-[0_-6px_20px_rgb(0_0_0_/_0.35)] rounded-t-2xl overflow-hidden">
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
