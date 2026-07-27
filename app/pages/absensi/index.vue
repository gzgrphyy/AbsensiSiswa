<script setup lang="ts">
interface JadwalHariIni {
  id: number
  mapel: string
  jamMulai: string
  jamSelesai: string
  hari: string
  isWithinTime: boolean
  activeSesi: { id: number; status: string } | null
  todaySesi: { id: number; status: string } | null
  kelas: { id: number; nama: string }
  ruangan: { id: number; nama: string; qrCode: string }
}

interface ActiveSesi {
  id: number
  status: string
  tanggal: string
  createdAt: string
  _count: { requests: number }
  jadwal: {
    mapel: string
    jamMulai: string
    jamSelesai: string
    kelas: { id: number; nama: string }
    ruangan: { id: number; nama: string }
  }
}

const { user, clear } = useUserSession()

const jadwal = ref<JadwalHariIni[]>([])
const activeSesiList = ref<ActiveSesi[]>([])
const loading = ref(true)
const errorMsg = ref('')
const successMsg = ref('')
const openingSesi = ref<number | null>(null)
const closingSesi = ref<number | null>(null)
const confirmClose = ref<ActiveSesi | null>(null)

const dayNames = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU']
const todayName = dayNames[new Date().getDay()]
const todayDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

function showError(msg: string) {
  errorMsg.value = msg
  setTimeout(() => { errorMsg.value = '' }, 5000)
}

function showSuccess(msg: string) {
  successMsg.value = msg
  setTimeout(() => { successMsg.value = '' }, 3000)
}

async function fetchData() {
  try {
    const [j, a] = await Promise.all([
      $fetch<JadwalHariIni[]>('/api/absensi/jadwal-hari-ini'),
      $fetch<ActiveSesi[]>('/api/absensi/sesi/aktif')
    ])
    jadwal.value = j
    activeSesiList.value = a
  } catch (err: any) {
    showError(err?.data?.statusMessage || 'Gagal memuat data')
  } finally {
    loading.value = false
  }
}

async function bukaSesi(jadwalId: number) {
  openingSesi.value = jadwalId
  errorMsg.value = ''
  try {
    await $fetch('/api/absensi/sesi/buka', { method: 'POST', body: { jadwalId } })
    showSuccess('Sesi berhasil dibuka')
    await fetchData()
  } catch (err: any) {
    showError(err?.data?.statusMessage || 'Gagal membuka sesi')
  } finally {
    openingSesi.value = null
  }
}

async function tutupSesi(id: number) {
  closingSesi.value = id
  errorMsg.value = ''
  try {
    await $fetch(`/api/absensi/sesi/${id}/tutup`, { method: 'POST' })
    showSuccess('Sesi ditutup. Siswa yang tidak hadir otomatis tercatat Alpha.')
    confirmClose.value = null
    await fetchData()
  } catch (err: any) {
    showError(err?.data?.statusMessage || 'Gagal menutup sesi')
  } finally {
    closingSesi.value = null
  }
}

async function handleLogout() {
  try { await clear() } catch {}
  navigateTo('/login')
}

onMounted(fetchData)

const totalSiswaScan = computed(() => activeSesiList.value.reduce((sum, s) => sum + s._count.requests, 0))
const totalConfirmed = computed(() => activeSesiList.value.reduce((sum, s) => sum + s._count.requests, 0))
const hariIni = todayName
</script>

<template>
  <AppLayout>
    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      <StatCard label="Jadwal Hari Ini" :value="jadwal.length" variant="blue">
        <template #icon>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </template>
      </StatCard>

      <StatCard label="Sesi Aktif" :value="activeSesiList.length" variant="green">
        <template #icon>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </template>
      </StatCard>

      <StatCard label="Total Scan" :value="totalSiswaScan" variant="amber">
        <template #icon>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </template>
      </StatCard>

      <StatCard label="Hari" :value="hariIni" variant="gray" trend="neutral" trend-label="Sesi berjalan">
        <template #icon>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </template>
      </StatCard>
    </div>

    <Notification type="error" :message="errorMsg" :show="!!errorMsg" @dismiss="errorMsg = ''" />
    <Notification type="success" :message="successMsg" :show="!!successMsg" @dismiss="successMsg = ''" />

    <!-- Loading -->
    <LoadingSkeleton v-if="loading" type="card" :rows="2" />

    <template v-else>
      <!-- Active Sessions -->
      <div v-if="activeSesiList.length > 0" class="mb-5">
        <h2 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Sesi Aktif
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="sesi in activeSesiList" :key="sesi.id"
            class="bg-white rounded-lg border border-green-200 shadow-card p-5">
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="font-semibold text-gray-900">{{ sesi.jadwal.mapel }}</h3>
                <p class="text-sm text-gray-500">{{ sesi.jadwal.kelas.nama }} — {{ sesi.jadwal.ruangan.nama }}</p>
              </div>
              <BaseBadge variant="green" dot pulse>AKTIF</BaseBadge>
            </div>
            <div class="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span class="inline-flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ sesi.jadwal.jamMulai }} - {{ sesi.jadwal.jamSelesai }}
              </span>
              <span class="inline-flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ sesi._count.requests }} scan
              </span>
            </div>
            <div class="flex gap-2">
              <NuxtLink :to="`/absensi/sesi/${sesi.id}`"
                class="flex-1 text-center px-3 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors">
                Konfirmasi Kehadiran
              </NuxtLink>
              <button @click="confirmClose = sesi"
                class="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors">
                Tutup Sesi
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Today's Jadwal -->
      <div>
        <h2 class="text-sm font-semibold text-gray-900 mb-3">Jadwal {{ hariIni }}</h2>

        <div v-if="jadwal.length === 0" class="bg-white rounded-lg border border-gray-200 shadow-card p-10 text-center">
          <svg class="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-gray-500 font-medium">Tidak ada jadwal untuk hari ini</p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="j in jadwal" :key="j.id"
            class="bg-white rounded-lg border border-gray-200 shadow-card p-5"
            :class="{ 'ring-1 ring-blue-300': j.isWithinTime && !j.activeSesi }">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-semibold text-gray-900">{{ j.mapel }}</h3>
                  <span v-if="j.todaySesi">
                    <BaseBadge :variant="j.todaySesi.status === 'AKTIF' ? 'green' : 'gray'" size="sm">
                      {{ j.todaySesi.status === 'AKTIF' ? 'Sedang Berlangsung' : 'Selesai' }}
                    </BaseBadge>
                  </span>
                </div>
                <p class="text-sm text-gray-500">{{ j.kelas.nama }} — {{ j.ruangan.nama }}</p>
                <div class="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                  <span class="inline-flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ j.jamMulai }} - {{ j.jamSelesai }}
                  </span>
                  <span v-if="j.isWithinTime" class="inline-flex items-center gap-1 text-blue-600">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    Sekarang
                  </span>
                </div>
              </div>
              <div class="flex gap-2">
                <button v-if="!j.todaySesi || (j.todaySesi.status === 'SELESAI')"
                  @click="bukaSesi(j.id)"
                  :disabled="openingSesi === j.id"
                  class="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 disabled:opacity-50 inline-flex items-center gap-1.5">
                  <svg v-if="openingSesi === j.id" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  {{ openingSesi === j.id ? 'Membuka...' : 'Buka Sesi' }}
                </button>
                <NuxtLink v-else-if="j.activeSesi"
                  :to="`/absensi/sesi/${j.activeSesi.id}`"
                  class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-primary-100 inline-flex items-center gap-1.5">
                  Lihat
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal Confirm Close -->
    <ConfirmDialog
      :show="!!confirmClose"
      title="Tutup Sesi"
      :message="`${confirmClose?.jadwal.mapel} — ${confirmClose?.jadwal.kelas.nama}. Siswa yang belum scan akan tercatat Alpha.`"
      variant="warning"
      confirm-label="Ya, Tutup Sesi"
      :loading="closingSesi === confirmClose?.id"
      @confirm="confirmClose && tutupSesi(confirmClose.id)"
      @cancel="confirmClose = null"
    />
  </AppLayout>
</template>
