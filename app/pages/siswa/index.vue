<script setup lang="ts">
interface TodayRequest {
  id: number
  status: string
  scannedAt: string
  sesi: {
    id: number
    status: string
    jadwal: {
      mapel: string
      jamMulai: string
      jamSelesai: string
      ruangan: { id: number; nama: string }
      kelas: { id: number; nama: string }
    }
  }
}

interface StatusData {
  today: TodayRequest[]
  counts: { hadir: number; pending: number; sakit: number; izin: number; alpha: number }
  recentHistory: { id: number; tanggal: string; mapel: string; kelas: string; status: string; keterangan: string | null; scannedAt: string }[]
  kelas: { id: number; nama: string }
}

const { user, clear } = useUserSession()

const data = ref<StatusData | null>(null)
const loading = ref(true)
const errorMsg = ref('')

const statusLabels: Record<string, string> = {
  PENDING: 'Menunggu',
  HADIR: 'Hadir',
  SAKIT: 'Sakit',
  IZIN: 'Izin',
  ALPHA: 'Alpha'
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  HADIR: 'bg-green-100 text-green-700',
  SAKIT: 'bg-red-100 text-red-700',
  IZIN: 'bg-blue-100 text-blue-700',
  ALPHA: 'bg-gray-100 text-gray-500'
}

const statusDotColors: Record<string, string> = {
  PENDING: 'bg-amber-400',
  HADIR: 'bg-green-400',
  SAKIT: 'bg-red-400',
  IZIN: 'bg-blue-400',
  ALPHA: 'bg-gray-400'
}

async function fetchStatus() {
  try {
    data.value = await $fetch<StatusData>('/api/siswa/status')
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || 'Gagal memuat data'
  } finally {
    loading.value = false
  }
}

async function handleLogout() {
  try { await clear() } catch {}
  navigateTo('/login')
}

onMounted(fetchStatus)

// Poll every 15s for status updates
onMounted(() => {
  const interval = setInterval(fetchStatus, 15000)
  onUnmounted(() => clearInterval(interval))
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <header class="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/60 sticky top-0 z-30">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {{ user?.nama?.charAt(0)?.toUpperCase() || 'S' }}
          </div>
          <div>
            <h1 class="text-lg font-semibold text-gray-900">Dashboard Siswa</h1>
            <p class="text-sm text-gray-500">Selamat datang, {{ user?.nama }}</p>
          </div>
        </div>
        <button @click="handleLogout"
          class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Transition name="fade">
        <div v-if="errorMsg" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {{ errorMsg }}
        </div>
      </Transition>

      <!-- Scan Button -->
      <NuxtLink to="/siswa/scan"
        class="block mb-6 p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 text-white">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-white/20 rounded-xl">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-semibold">Scan QR Absensi</h2>
            <p class="text-sm text-white/80">Arahkan kamera ke QR Code di ruangan kelas</p>
          </div>
          <svg class="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </NuxtLink>

      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div class="h-5 bg-gray-200 rounded w-48 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-64"></div>
        </div>
      </div>

      <template v-else>
        <!-- Status Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
          <div class="flex items-center gap-4 mb-6">
            <div class="p-3 bg-blue-100 rounded-xl">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Status Absensi Hari Ini</h2>
              <p v-if="data && data.today.length === 0" class="text-sm text-gray-500">Belum ada sesi absensi aktif</p>
              <p v-else-if="data" class="text-sm text-gray-500">{{ data.kelas.nama }}</p>
            </div>
          </div>

          <!-- Today's sessions -->
          <div v-if="data && data.today.length > 0" class="space-y-3">
            <div v-for="req in data.today" :key="req.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div class="flex items-center gap-3">
                <span :class="`w-2 h-2 rounded-full ${statusDotColors[req.status] || 'bg-gray-400'}`"></span>
                <div>
                  <p class="font-medium text-gray-900">{{ req.sesi.jadwal.mapel }}</p>
                  <p class="text-xs text-gray-500">{{ req.sesi.jadwal.ruangan.nama }} — {{ req.sesi.jadwal.jamMulai }} - {{ req.sesi.jadwal.jamSelesai }}</p>
                </div>
              </div>
              <span :class="statusColors[req.status] || 'bg-gray-100 text-gray-500'"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ statusLabels[req.status] || req.status }}
              </span>
            </div>
          </div>

          <div v-else class="flex flex-col items-center justify-center py-6">
            <svg class="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <p class="text-gray-500 font-medium">Scan QR Ruangan untuk Absensi</p>
            <p class="text-sm text-gray-400 mt-1">Arahkan kamera ke QR code yang ada di ruangan kelas</p>
          </div>
        </div>

        <!-- Quick Info Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-green-100 rounded-lg">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Hadir</p>
                <p class="text-2xl font-bold text-gray-900">{{ data?.counts.hadir || 0 }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-amber-100 rounded-lg">
                <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Menunggu</p>
                <p class="text-2xl font-bold text-gray-900">{{ data?.counts.pending || 0 }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-purple-100 rounded-lg">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Riwayat</p>
                <p class="text-2xl font-bold text-gray-900">{{ (data?.counts.hadir || 0) + (data?.counts.sakit || 0) + (data?.counts.izin || 0) + (data?.counts.alpha || 0) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent History -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="font-semibold text-gray-900">Riwayat Absensi Terbaru</h3>
          </div>
          <div v-if="data && data.recentHistory.length > 0" class="divide-y divide-gray-100">
            <div v-for="item in data.recentHistory" :key="item.id"
              class="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div class="flex items-center gap-3">
                <span :class="`w-2 h-2 rounded-full ${statusDotColors[item.status] || 'bg-gray-400'}`"></span>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ item.mapel }}</p>
                  <p class="text-xs text-gray-500">{{ new Date(item.tanggal).toLocaleDateString('id-ID') }} — {{ item.kelas }}</p>
                </div>
              </div>
              <span :class="statusColors[item.status] || 'bg-gray-100 text-gray-500'"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ statusLabels[item.status] || item.status }}
              </span>
            </div>
          </div>
          <div v-else class="p-10 flex flex-col items-center justify-center text-center">
            <svg class="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-gray-500 font-medium">Belum ada riwayat absensi</p>
            <p class="text-sm text-gray-400 mt-1">Riwayat akan muncul setelah kamu melakukan absensi</p>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
