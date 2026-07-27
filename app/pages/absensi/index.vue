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
const hariIni = todayName
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
    <header class="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/60 sticky top-0 z-30">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {{ user?.nama?.charAt(0)?.toUpperCase() || 'G' }}
          </div>
          <div>
            <h1 class="text-lg font-semibold text-gray-900">Dashboard Guru</h1>
            <p class="text-sm text-gray-500">Selamat datang, {{ user?.nama }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-400 hidden sm:inline">{{ todayDate }}</span>
          <button @click="handleLogout"
            class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Notifications -->
      <Transition name="slide">
        <div v-if="errorMsg" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2 shadow-sm">
          <span class="flex-1">{{ errorMsg }}</span>
          <button @click="errorMsg = ''" class="p-0.5 hover:bg-red-100 rounded"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
      </Transition>
      <Transition name="slide">
        <div v-if="successMsg" class="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2 shadow-sm">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span class="flex-1">{{ successMsg }}</span>
          <button @click="successMsg = ''" class="p-0.5 hover:bg-green-100 rounded"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
      </Transition>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-indigo-100 rounded-lg">
              <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Jadwal Hari Ini</p>
              <p class="text-2xl font-bold text-gray-900">{{ jadwal.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-green-100 rounded-lg">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Sesi Aktif</p>
              <p class="text-2xl font-bold text-gray-900">{{ activeSesiList.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-amber-100 rounded-lg">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Scan</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalSiswaScan }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 2" :key="i" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div class="h-5 bg-gray-200 rounded w-48 mb-3"></div>
          <div class="h-4 bg-gray-200 rounded w-64 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>

      <template v-else>
        <!-- Active Sessions -->
        <div v-if="activeSesiList.length > 0" class="mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Sesi Aktif
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="sesi in activeSesiList" :key="sesi.id"
              class="bg-white rounded-xl shadow-sm border border-green-200 p-5 hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="font-semibold text-gray-900">{{ sesi.jadwal.mapel }}</h3>
                  <p class="text-sm text-gray-500">{{ sesi.jadwal.kelas.nama }} — {{ sesi.jadwal.ruangan.nama }}</p>
                </div>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  AKTIF
                </span>
              </div>
              <div class="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span class="inline-flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {{ sesi.jadwal.jamMulai }} - {{ sesi.jadwal.jamSelesai }}
                </span>
                <span class="inline-flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {{ sesi._count.requests }} scan
                </span>
              </div>
              <div class="flex gap-2">
                <NuxtLink :to="`/absensi/sesi/${sesi.id}`"
                  class="flex-1 text-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
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
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Jadwal {{ hariIni }}</h2>

          <div v-if="jadwal.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
            <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-gray-500 font-medium">Tidak ada jadwal untuk hari ini</p>
          </div>

          <div v-else class="space-y-3">
            <div v-for="j in jadwal" :key="j.id"
              class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
              :class="{ 'ring-2 ring-blue-200': j.isWithinTime && !j.activeSesi }">
              <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-semibold text-gray-900">{{ j.mapel }}</h3>
                    <span v-if="j.todaySesi"
                      class="text-xs font-medium px-2 py-0.5 rounded-full"
                      :class="j.todaySesi.status === 'AKTIF' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                      {{ j.todaySesi.status === 'AKTIF' ? 'Sedang Berlangsung' : 'Selesai' }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-500">
                    {{ j.kelas.nama }} — {{ j.ruangan.nama }}
                  </p>
                  <div class="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    <span class="inline-flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {{ j.jamMulai }} - {{ j.jamSelesai }}
                    </span>
                    <span v-if="j.isWithinTime" class="inline-flex items-center gap-1 text-blue-500">
                      <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                      Sekarang
                    </span>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button v-if="!j.todaySesi || (j.todaySesi.status === 'SELESAI')"
                    @click="bukaSesi(j.id)"
                    :disabled="openingSesi === j.id"
                    class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5">
                    <svg v-if="openingSesi === j.id" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    {{ openingSesi === j.id ? 'Membuka...' : 'Buka Sesi' }}
                  </button>
                  <NuxtLink v-else-if="j.activeSesi"
                    :to="`/absensi/sesi/${j.activeSesi.id}`"
                    class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 inline-flex items-center gap-1.5">
                    Lihat
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </main>

    <!-- Modal Confirm Close -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="confirmClose" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="confirmClose = null"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto p-6 border border-gray-100">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-amber-100 rounded-full">
                <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Tutup Sesi</h2>
                <p class="text-sm text-gray-500">{{ confirmClose.jadwal.mapel }} — {{ confirmClose.jadwal.kelas.nama }}</p>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-3">
              Siswa yang <strong>belum melakukan scan</strong> akan otomatis tercatat sebagai <strong>Alpha</strong>.
            </p>
            <p class="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4">
              Pastikan kamu sudah mengonfirmasi kehadiran sebelum menutup sesi.
            </p>
            <div class="flex justify-end gap-3">
              <button @click="confirmClose = null" class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Batal</button>
              <button @click="tutupSesi(confirmClose.id)" :disabled="closingSesi === confirmClose.id"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-1.5">
                <svg v-if="closingSesi === confirmClose.id" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                {{ closingSesi === confirmClose.id ? 'Menutup...' : 'Ya, Tutup Sesi' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active { transition: all 0.2s ease-out; }
.modal-leave-active { transition: all 0.15s ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > div:last-child, .modal-leave-to > div:last-child { transform: scale(0.95); }
.slide-enter-active { transition: all 0.3s ease-out; }
.slide-leave-active { transition: all 0.2s ease-in; }
.slide-enter-from { transform: translateY(-10px); opacity: 0; }
.slide-leave-to { transform: translateY(-10px); opacity: 0; }
</style>
