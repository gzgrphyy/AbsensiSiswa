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

interface MingguanJadwal {
  id: number
  hari: string
  mapel: string
  jamMulai: string
  jamSelesai: string
  kelas: { id: number; nama: string }
  ruangan: { id: number; nama: string }
}

const { user } = useUserSession()
const { adaJadwal } = useJadwalHariIni()

const jadwal = ref<JadwalHariIni[]>([])
const activeSesiList = ref<ActiveSesi[]>([])
const loading = ref(true)
const errorMsg = ref('')
const successMsg = ref('')
const openingSesi = ref<number | null>(null)
const closingSesi = ref<number | null>(null)
const confirmClose = ref<ActiveSesi | null>(null)

const { data: jadwalMingguan } = useFetch<{ hariOrder: string[]; grouped: Record<string, MingguanJadwal[]> }>('/api/absensi/jadwal-mingguan', {
  immediate: true
})

const totalJadwalMinggu = computed(() =>
  Object.values(jadwalMingguan.value?.grouped || {}).reduce((a, arr) => a + arr.length, 0)
)
const jumlahHariMinggu = computed(() =>
  Object.keys(jadwalMingguan.value?.grouped || {}).length
)

const todayLabel = computed(() =>
  new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
)

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Selamat pagi'
  if (h >= 12 && h < 15) return 'Selamat siang'
  if (h >= 15 && h < 18) return 'Selamat sore'
  return 'Selamat malam'
})

const isWeekend = computed(() => {
  const d = new Date().getDay()
  return d === 0 || d === 6
})

const emptyState = computed(() => {
  if (jadwal.value.length === 0 && isWeekend.value) {
    return { title: 'Hari ini libur.', cta: 'Lihat Rekap', to: '/absensi/rekap' }
  }
  if (jadwal.value.length === 0) {
    return { title: 'Tidak ada kelas hari ini.', cta: 'Lihat Rekap', to: '/absensi/rekap' }
  }
  return null
})

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
    showSuccess('Sesi ditutup.')
    confirmClose.value = null
    await fetchData()
  } catch (err: any) {
    showError(err?.data?.statusMessage || 'Gagal menutup sesi')
  } finally {
    closingSesi.value = null
  }
}

onMounted(() => {
  fetchData()
  const { refresh: refreshJadwal } = useJadwalHariIni()
  const interval = setInterval(() => {
    fetchData()
    refreshJadwal()
  }, 30000)
  onUnmounted(() => clearInterval(interval))
})

const totalSiswaScan = computed(() => activeSesiList.value.reduce((sum, s) => sum + s._count.requests, 0))
</script>

<template>
  <PTKLayout>
    <!-- Greeting -->
    <header class="mb-5">
      <p class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{{ todayLabel }}</p>
      <h1 class="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mt-1">
        {{ greeting }}, {{ user?.nama || 'Pak/Bu' }}
      </h1>
    </header>

    <Notification type="error" :message="errorMsg" :show="!!errorMsg" @dismiss="errorMsg = ''" />
    <Notification type="success" :message="successMsg" :show="!!successMsg" @dismiss="successMsg = ''" />

    <!-- ===== Loading skeleton ===== -->
    <template v-if="loading">
      <div class="h-28 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 animate-pulse">
        <div class="h-3 bg-gray-100 dark:bg-slate-700 rounded w-16 mb-3"></div>
        <div class="h-5 bg-gray-100 dark:bg-slate-700 rounded w-2/3 mb-2"></div>
        <div class="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/2 mt-4"></div>
      </div>
      <div class="h-24 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 animate-pulse mt-3">
        <div class="h-4 bg-gray-100 dark:bg-slate-700 rounded w-24 mb-2"></div>
        <div class="h-8 bg-gray-100 dark:bg-slate-700 rounded w-16"></div>
      </div>
      <div class="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden animate-pulse mt-3">
        <div v-for="i in 2" :key="i" class="flex items-center gap-3 p-4">
          <div class="w-12 h-8 bg-gray-100 dark:bg-slate-700 rounded-lg"></div>
          <div class="flex-1">
            <div class="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
            <div class="h-3 bg-gray-100 dark:bg-slate-700 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    </template>

    <!-- ===== Data loaded ===== -->
    <template v-else>
      <!-- Active session -->
      <template v-if="activeSesiList.length > 0">
        <section
          v-for="sesi in activeSesiList"
          :key="sesi.id"
          class="rounded-2xl border border-gray-200 dark:border-slate-700 border-l-4 border-l-primary-500 bg-white dark:bg-slate-800 shadow-card dark:shadow-dark-card p-5 mb-3"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <span class="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-primary-600 dark:text-primary-400">
                <span class="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                Sesi aktif
              </span>
              <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 truncate mt-1">{{ sesi.jadwal.mapel }}</h2>
            </div>
            <span class="flex-shrink-0 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 ring-1 ring-primary-200 dark:ring-primary-800">
              {{ sesi._count.requests }} scan
            </span>
          </div>

          <div class="flex items-center justify-between gap-3 text-sm mt-4">
            <span class="text-gray-600 dark:text-gray-300 truncate">Kelas <b class="font-semibold text-gray-900 dark:text-gray-100">{{ sesi.jadwal.kelas.nama }}</b> · {{ sesi.jadwal.ruangan.nama }}</span>
            <span class="font-semibold text-gray-900 dark:text-gray-100 flex-shrink-0">{{ sesi._count.requests }} scan</span>
          </div>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">{{ sesi.jadwal.jamMulai }} – {{ sesi.jadwal.jamSelesai }}</p>

          <div class="flex gap-2.5 mt-4">
            <NuxtLink
              :to="`/absensi/sesi/${sesi.id}`"
              class="flex-1 text-center px-3 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-xl hover:bg-primary-600 active:bg-primary-700 transition-colors shadow-md shadow-primary-500/30"
            >
              Konfirmasi Kehadiran
            </NuxtLink>
            <button
              @click="confirmClose = sesi"
              class="px-3 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 border border-gray-200 dark:border-slate-700 rounded-xl transition-colors"
            >
              Tutup Sesi
            </button>
          </div>
        </section>
      </template>

      <!-- Idle session card -->
      <section
        v-else-if="jadwal.length > 0"
        class="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card dark:shadow-dark-card p-4 mb-3"
      >
        <div class="flex items-center gap-3">
          <div class="w-1 self-stretch rounded-full bg-gray-200 dark:bg-slate-600 flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">Siap membuka sesi kehadiran</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Buka sesi dari jadwal di bawah saat kelas dimulai.</p>
          </div>
          <NuxtLink
            to="/absensi/rekap#jadwal-minggu"
            class="flex-shrink-0 px-3.5 py-2 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 ring-1 ring-primary-200 dark:ring-primary-800 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/60 transition-colors"
          >
            Lihat jadwal
          </NuxtLink>
        </div>
      </section>

      <!-- Asymmetric stats -->
      <div class="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card dark:shadow-dark-card p-5 mt-3">
        <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Scan hari ini</p>
        <p class="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mt-1 leading-none tracking-tight">{{ totalSiswaScan }}</p>
      </div>

      <!-- Weekly schedule shortcut -->
      <section class="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card dark:shadow-dark-card p-5 mt-3">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Jadwal Minggu Ini</p>
            <p class="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1 truncate">
              {{ totalJadwalMinggu > 0 ? `${totalJadwalMinggu} sesi · ${jumlahHariMinggu} hari` : 'Belum ada jadwal untuk minggu ini.' }}
            </p>
          </div>
          <NuxtLink
            to="/absensi/rekap#jadwal-minggu"
            class="flex-shrink-0 px-3.5 py-2 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 ring-1 ring-primary-200 dark:ring-primary-800 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/60 transition-colors"
          >
            Lihat di Rekap
          </NuxtLink>
        </div>
      </section>

      <!-- Today's schedule -->
      <section id="jadwal-hari-ini" class="mt-5">
        <h2 class="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight">Jadwal Hari Ini</h2>

        <div
          v-if="jadwal.length === 0"
          class="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card py-8 px-6 text-center"
        >
          <p class="text-base font-bold text-gray-900 dark:text-gray-100">{{ emptyState?.title }}</p>
          <NuxtLink
            :to="emptyState?.to || '/absensi/rekap'"
            class="inline-flex items-center gap-1.5 mt-4 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 active:bg-primary-700 transition-colors shadow-md shadow-primary-500/30"
          >
            {{ emptyState?.cta }}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </NuxtLink>
        </div>

        <div
          v-else
          class="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card dark:shadow-dark-card overflow-hidden divide-y divide-gray-100 dark:divide-slate-700"
        >
          <div
            v-for="j in jadwal"
            :key="j.id"
            class="flex items-center gap-3 px-4 py-3.5"
            :class="!j.todaySesi && j.isWithinTime ? 'border-l-2 border-l-primary-500 bg-primary-50/40 dark:bg-primary-900/20' : (j.activeSesi ? 'bg-primary-50/30 dark:bg-primary-900/10' : '')"
          >
            <div class="w-14 flex-shrink-0 text-center">
              <p class="text-[13px] font-bold text-gray-900 dark:text-gray-100 leading-none">{{ j.jamMulai }}</p>
              <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-none">{{ j.jamSelesai }}</p>
              <p v-if="j.isWithinTime && !j.todaySesi" class="text-[9px] font-bold uppercase tracking-wide text-primary-600 dark:text-primary-400 mt-1 leading-none animate-pulse">Buka</p>
              <p v-else-if="j.todaySesi?.status === 'SELESAI'" class="text-[9px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mt-1 leading-none">Selesai</p>
            </div>

            <div class="min-w-0 flex-1">
              <h3 class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ j.mapel }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ j.kelas.nama }} · {{ j.ruangan.nama }}</p>
            </div>

            <button
              v-if="!j.todaySesi"
              @click="bukaSesi(j.id)"
              :disabled="openingSesi === j.id"
              class="flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-50 inline-flex items-center gap-1.5 transition-colors"
            >
              <svg v-if="openingSesi === j.id" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              {{ openingSesi === j.id ? 'Membuka...' : 'Buka Sesi' }}
            </button>
            <span
              v-else-if="j.todaySesi.status === 'SELESAI'"
              class="flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700/60 ring-1 ring-gray-200 dark:ring-slate-600"
            >
              Selesai
            </span>
            <NuxtLink
              v-else-if="j.activeSesi"
              :to="`/absensi/sesi/${j.activeSesi.id}`"
              class="flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 ring-1 ring-primary-200 dark:ring-primary-800 inline-flex items-center gap-1 hover:bg-primary-100 dark:hover:bg-primary-900/60 transition-colors"
            >
              Lihat
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </NuxtLink>
          </div>
        </div>
      </section>
    </template>

    <!-- Modal Confirm Close -->
    <ConfirmDialog
      :show="!!confirmClose"
      title="Tutup Sesi"
      :message="`${confirmClose?.jadwal.mapel} — ${confirmClose?.jadwal.kelas.nama}. Murid yang belum scan tidak otomatis tercatat. Pastikan kehadiran sudah dikonfirmasi.`"
      variant="warning"
      confirm-label="Ya, Tutup Sesi"
      :loading="closingSesi === confirmClose?.id"
      @confirm="confirmClose && tutupSesi(confirmClose.id)"
      @cancel="confirmClose = null"
    />
  </PTKLayout>
</template>