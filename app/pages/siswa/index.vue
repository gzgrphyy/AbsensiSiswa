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

const statusBadgeVariant: Record<string, string> = {
  PENDING: 'amber',
  HADIR: 'green',
  SAKIT: 'red',
  IZIN: 'blue',
  ALPHA: 'gray'
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

onMounted(() => {
  const interval = setInterval(fetchStatus, 15000)
  onUnmounted(() => clearInterval(interval))
})

const totalKehadiran = computed(() => {
  if (!data.value) return 0
  return data.value.counts.hadir + data.value.counts.sakit + data.value.counts.izin + data.value.counts.alpha
})
</script>

<template>
  <AppLayout>
    <Notification type="error" :message="errorMsg" :show="!!errorMsg" @dismiss="errorMsg = ''" />

    <!-- Scan QR CTA -->
    <NuxtLink to="/siswa/scan"
      class="block mb-5 p-5 bg-white rounded-lg border border-gray-200 shadow-card hover:shadow-card-hover transition-shadow">
      <div class="flex items-center gap-4">
        <div class="p-3 bg-blue-100 rounded-lg flex-shrink-0">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <div class="flex-1">
          <h2 class="text-sm font-semibold text-gray-900">Scan QR Absensi</h2>
          <p class="text-xs text-gray-500">Arahkan kamera ke QR Code di ruangan kelas</p>
        </div>
        <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </NuxtLink>

    <!-- Loading -->
    <LoadingSkeleton v-if="loading" type="text" :rows="5" />

    <template v-else>
      <!-- Status Card -->
      <BaseCard class="mb-5">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2.5 bg-blue-100 rounded-lg">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-gray-900">Status Absensi Hari Ini</h2>
            <p v-if="data && data.today.length === 0" class="text-xs text-gray-500">Belum ada sesi absensi aktif</p>
            <p v-else-if="data" class="text-xs text-gray-500">{{ data.kelas.nama }}</p>
          </div>
        </div>

        <div v-if="data && data.today.length > 0" class="space-y-2">
          <div v-for="req in data.today" :key="req.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div class="flex items-center gap-3">
              <span class="w-2 h-2 rounded-full" :class="{
                'bg-green-500': req.status === 'HADIR',
                'bg-amber-400': req.status === 'PENDING',
                'bg-red-500': req.status === 'SAKIT',
                'bg-blue-500': req.status === 'IZIN',
                'bg-gray-400': req.status === 'ALPHA',
              }"></span>
              <div>
                <p class="font-medium text-gray-900 text-sm">{{ req.sesi.jadwal.mapel }}</p>
                <p class="text-xs text-gray-500">{{ req.sesi.jadwal.ruangan.nama }} — {{ req.sesi.jadwal.jamMulai }} - {{ req.sesi.jadwal.jamSelesai }}</p>
              </div>
            </div>
            <BaseBadge :variant="statusBadgeVariant[req.status] || 'gray'" size="sm">
              {{ statusLabels[req.status] || req.status }}
            </BaseBadge>
          </div>
        </div>

        <div v-else class="flex flex-col items-center py-6">
          <svg class="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <p class="text-gray-500 font-medium">Scan QR Ruangan untuk Absensi</p>
          <p class="text-xs text-gray-400 mt-1">Arahkan kamera ke QR code yang ada di ruangan kelas</p>
        </div>
      </BaseCard>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <StatCard label="Hadir" :value="data?.counts.hadir || 0" variant="green">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </template>
        </StatCard>

        <StatCard label="Menunggu" :value="data?.counts.pending || 0" variant="amber">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </template>
        </StatCard>

        <StatCard label="Total Kehadiran" :value="totalKehadiran" variant="blue">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </template>
        </StatCard>
      </div>

      <!-- Recent History -->
      <BaseCard>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-gray-900">Riwayat Absensi Terbaru</h3>
          <NuxtLink to="/siswa/riwayat" class="text-xs text-blue-600 hover:text-blue-800 font-medium">Lihat Semua</NuxtLink>
        </div>
        <div v-if="data && data.recentHistory.length > 0" class="divide-y divide-gray-100">
          <div v-for="item in data.recentHistory" :key="item.id"
            class="py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors -mx-5 px-5">
            <div class="flex items-center gap-3">
              <span class="w-2 h-2 rounded-full" :class="{
                'bg-green-500': item.status === 'HADIR',
                'bg-amber-400': item.status === 'PENDING',
                'bg-red-500': item.status === 'SAKIT',
                'bg-blue-500': item.status === 'IZIN',
                'bg-gray-400': item.status === 'ALPHA',
              }"></span>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ item.mapel }}</p>
                <p class="text-xs text-gray-500">{{ new Date(item.tanggal).toLocaleDateString('id-ID') }} — {{ item.kelas }}</p>
              </div>
            </div>
            <BaseBadge :variant="statusBadgeVariant[item.status] || 'gray'" size="sm">
              {{ statusLabels[item.status] || item.status }}
            </BaseBadge>
          </div>
        </div>
        <div v-else class="py-6 text-center">
          <p class="text-gray-500 font-medium text-sm">Belum ada riwayat absensi</p>
        </div>
      </BaseCard>
    </template>
  </AppLayout>
</template>
