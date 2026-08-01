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

const dayNames = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU']
const todayName = dayNames[new Date().getDay()]
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
    showSuccess('Sesi ditutup. Murid yang tidak hadir otomatis tercatat Alpha.')
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
      <p class="text-xs text-gray-400 dark:text-gray-500 capitalize">{{ todayLabel }}</p>
      <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
        {{ greeting }}, {{ user?.nama || 'PTK' }}
      </h1>
      <p v-if="!loading" class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
        Anda memiliki {{ jadwal.length }} jadwal hari ini
      </p>
    </header>

    <Notification type="error" :message="errorMsg" :show="!!errorMsg" @dismiss="errorMsg = ''" />
    <Notification type="success" :message="successMsg" :show="!!successMsg" @dismiss="successMsg = ''" />

    <!-- ===== Loading skeleton ===== -->
    <template v-if="loading">
      <div class="h-36 rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card dark:shadow-dark-card p-5 animate-pulse">
        <div class="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/3 mb-3"></div>
        <div class="h-6 bg-gray-100 dark:bg-slate-700 rounded w-1/2 mb-3"></div>
        <div class="h-3 bg-gray-100 dark:bg-slate-700 rounded w-2/3 mb-2"></div>
        <div class="h-3 bg-gray-100 dark:bg-slate-700 rounded w-1/2"></div>
      </div>
      <div class="grid grid-cols-2 gap-3 mt-4">
        <div v-for="i in 2" :key="i" class="h-20 rounded-xl bg-gray-100 dark:bg-slate-700 animate-pulse"></div>
      </div>
      <div class="h-44 rounded-2xl bg-gray-100 dark:bg-slate-700 animate-pulse mt-4"></div>
    </template>

    <!-- ===== Data loaded ===== -->
    <template v-else>
      <!-- Active sessions -->
      <template v-if="activeSesiList.length > 0">
        <section
          v-for="sesi in activeSesiList"
          :key="sesi.id"
          class="rounded-2xl border p-5 shadow-card dark:shadow-dark-card mb-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-900/20 border-green-200 dark:border-green-800"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex-shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-green-800 dark:text-green-200">Sesi aktif</p>
              <p class="text-xl font-bold text-green-900 dark:text-green-100 truncate">{{ sesi.jadwal.mapel }}</p>
            </div>
            <BaseBadge variant="green" dot pulse class="ml-auto">AKTIF</BaseBadge>
          </div>

          <dl class="space-y-1.5 text-sm">
            <div class="flex items-center justify-between gap-3">
              <dt class="text-green-700/80 dark:text-green-300/80">Kelas</dt>
              <dd class="font-semibold text-green-900 dark:text-green-100">{{ sesi.jadwal.kelas.nama }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-green-700/80 dark:text-green-300/80">Ruangan</dt>
              <dd class="font-semibold text-green-900 dark:text-green-100">{{ sesi.jadwal.ruangan.nama }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-green-700/80 dark:text-green-300/80">Waktu</dt>
              <dd class="font-semibold text-green-900 dark:text-green-100">{{ sesi.jadwal.jamMulai }} - {{ sesi.jadwal.jamSelesai }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-green-700/80 dark:text-green-300/80">Scan masuk</dt>
              <dd class="font-semibold text-green-900 dark:text-green-100">{{ sesi._count.requests }} murid</dd>
            </div>
          </dl>

          <div class="flex gap-2 mt-4">
            <NuxtLink
              :to="`/absensi/sesi/${sesi.id}`"
              class="flex-1 text-center px-3 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-xl hover:bg-primary-600 active:bg-primary-700 transition-colors shadow-md shadow-primary-500/30"
            >
              Konfirmasi Kehadiran
            </NuxtLink>
            <button
              @click="confirmClose = sesi"
              class="px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl transition-colors"
            >
              Tutup Sesi
            </button>
          </div>
        </section>
      </template>

      <!-- No active session -->
      <section
        v-else
        class="rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-card dark:shadow-dark-card p-5"
      >
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 flex-shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="font-semibold text-gray-800 dark:text-gray-200">Tidak ada sesi aktif</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {{ adaJadwal === false ? 'Belum ada jadwal hari ini, hubungi admin untuk mengatur jadwal kelas' : 'Buka sesi dari jadwal hari ini di bawah' }}
            </p>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-3 mt-4">
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
      </div>

      <!-- Today's Jadwal -->
      <section class="mt-4">
        <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          Jadwal Hari Ini
          <span class="text-[11px] font-normal text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{{ todayName }}</span>
        </h2>

        <div
          v-if="jadwal.length === 0"
          class="rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-card dark:shadow-dark-card flex flex-col items-center py-10 px-6 text-center"
        >
          <svg class="w-10 h-10 text-gray-300 dark:text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Tidak ada jadwal untuk hari ini</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Hubungi admin untuk mengatur jadwal kelas</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="j in jadwal"
            :key="j.id"
            class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-card dark:shadow-dark-card p-5"
            :class="{ 'ring-1 ring-blue-300 dark:ring-blue-600': j.isWithinTime && !j.activeSesi }"
          >
            <div class="flex items-center justify-between gap-3 mb-1">
              <h3 class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ j.mapel }}</h3>
              <span v-if="j.todaySesi">
                <BaseBadge :variant="j.todaySesi.status === 'AKTIF' ? 'green' : 'gray'" size="sm">
                  {{ j.todaySesi.status === 'AKTIF' ? 'Sedang Berlangsung' : 'Selesai' }}
                </BaseBadge>
              </span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ j.kelas.nama }} — {{ j.ruangan.nama }}</p>

            <div class="flex items-center justify-between gap-3 mt-3">
              <div class="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                <span class="inline-flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ j.jamMulai }} - {{ j.jamSelesai }}
                </span>
                <span v-if="j.isWithinTime" class="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  Sekarang
                </span>
              </div>

              <button
                v-if="!j.todaySesi || (j.todaySesi.status === 'SELESAI')"
                @click="bukaSesi(j.id)"
                :disabled="openingSesi === j.id"
                class="flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-xl hover:bg-primary-600 active:bg-primary-700 disabled:opacity-50 inline-flex items-center gap-1.5 transition-colors"
              >
                <svg v-if="openingSesi === j.id" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                {{ openingSesi === j.id ? 'Membuka...' : 'Buka Sesi' }}
              </button>
              <NuxtLink
                v-else-if="j.activeSesi"
                :to="`/absensi/sesi/${j.activeSesi.id}`"
                class="flex-shrink-0 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-xl inline-flex items-center gap-1.5"
              >
                Lihat
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- Modal Confirm Close -->
    <ConfirmDialog
      :show="!!confirmClose"
      title="Tutup Sesi"
      :message="`${confirmClose?.jadwal.mapel} — ${confirmClose?.jadwal.kelas.nama}. Murid yang belum scan akan tercatat Alpha.`"
      variant="warning"
      confirm-label="Ya, Tutup Sesi"
      :loading="closingSesi === confirmClose?.id"
      @confirm="confirmClose && tutupSesi(confirmClose.id)"
      @cancel="confirmClose = null"
    />
  </PTKLayout>
</template>
