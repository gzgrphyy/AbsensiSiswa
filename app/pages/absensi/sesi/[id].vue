<script setup lang="ts">
interface SiswaItem {
  id: number
  nisn: string
  nama: string
  request: {
    id: number
    status: string
    scannedAt: string
    keterangan: string | null
  } | null
}

interface SesiDetail {
  id: number
  status: string
  tanggal: string
  allSiswa: SiswaItem[]
  jadwal: {
    mapel: string
    jamMulai: string
    jamSelesai: string
    kelas: { id: number; nama: string }
    ruangan: { id: number; nama: string }
    guru: { id: number; nama: string }
  }
}

const route = useRoute()
const sesiId = computed(() => parseInt(route.params.id as string))

const sesi = ref<SesiDetail | null>(null)
const entries = ref<Map<number, { checked: boolean; status: string; keterangan: string }>>(new Map())
const loading = ref(true)
const submitting = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

function showError(msg: string) {
  errorMsg.value = msg
  setTimeout(() => { errorMsg.value = '' }, 5000)
}

function showSuccess(msg: string) {
  successMsg.value = msg
  setTimeout(() => { successMsg.value = '' }, 3000)
}

async function fetchSesi() {
  try {
    const data = await $fetch<SesiDetail>(`/api/absensi/sesi/${sesiId.value}`)
    sesi.value = data

    const map = new Map()
    for (const s of data.allSiswa) {
      const isPending = s.request?.status === 'PENDING'
      map.set(s.id, {
        checked: isPending || s.request?.status === 'HADIR',
        status: s.request?.status === 'HADIR' ? 'HADIR' : isPending ? 'HADIR' : s.request?.status || 'ALPHA',
        keterangan: s.request?.keterangan || ''
      })
    }
    entries.value = map
  } catch (err: any) {
    showError(err?.data?.statusMessage || 'Gagal memuat data sesi')
  } finally {
    loading.value = false
  }
}

function toggleSiswa(siswaId: number) {
  const e = entries.value.get(siswaId)
  if (e) {
    e.checked = !e.checked
    if (!e.checked && e.status === 'HADIR') {
      e.status = 'ALPHA'
    } else if (e.checked && e.status === 'ALPHA') {
      e.status = 'HADIR'
    }
  }
}

function setStatus(siswaId: number, status: string) {
  const e = entries.value.get(siswaId)
  if (e) {
    e.status = status
    e.checked = status !== 'ALPHA'
  }
}

const statusCount = computed(() => {
  const counts: Record<string, number> = { HADIR: 0, SAKIT: 0, IZIN: 0, ALPHA: 0, PENDING: 0 }
  for (const e of entries.value.values()) {
    counts[e.status] = (counts[e.status] || 0) + 1
  }
  return counts
})

async function submitKonfirmasi() {
  if (!sesi.value) return
  submitting.value = true
  errorMsg.value = ''

  const payload = {
    entries: Array.from(entries.value.entries())
      .filter(([_, e]) => e.status !== 'PENDING')
      .map(([siswaId, e]) => ({
        siswaId,
        status: e.status as 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPHA',
        keterangan: e.keterangan || null
      }))
  }

  try {
    await $fetch(`/api/absensi/sesi/${sesiId.value}/konfirmasi`, {
      method: 'POST',
      body: payload
    })
    showSuccess('Kehadiran berhasil dikonfirmasi')
    await fetchSesi()
  } catch (err: any) {
    showError(err?.data?.statusMessage || 'Gagal mengonfirmasi kehadiran')
  } finally {
    submitting.value = false
  }
}

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
  ALPHA: 'bg-gray-100 text-gray-600'
}

const statusBadge = (status: string) => {
  return `${statusColors[status] || 'bg-gray-100 text-gray-600'} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`
}

onMounted(fetchSesi)

// Poll every 10s for new scans
onMounted(() => {
  const interval = setInterval(fetchSesi, 10000)
  onUnmounted(() => clearInterval(interval))
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <header class="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/60 sticky top-0 z-30">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <NuxtLink to="/absensi" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </NuxtLink>
          <div>
            <h1 class="text-lg font-semibold text-gray-900" v-if="sesi">{{ sesi.jadwal.mapel }}</h1>
            <p class="text-sm text-gray-500" v-if="sesi">{{ sesi.jadwal.kelas.nama }} — {{ sesi.jadwal.ruangan.nama }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="sesi && sesi.status === 'AKTIF'"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            AKTIF
          </span>
          <span v-else-if="sesi"
            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            SELESAI
          </span>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Transition name="slide">
        <div v-if="errorMsg" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2 shadow-sm">
          <span class="flex-1">{{ errorMsg }}</span>
          <button @click="errorMsg = ''" class="p-0.5 hover:bg-red-100 rounded"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
      </Transition>
      <Transition name="slide">
        <div v-if="successMsg" class="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2 shadow-sm">
          <span class="flex-1">{{ successMsg }}</span>
          <button @click="successMsg = ''" class="p-0.5 hover:bg-green-100 rounded"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
        </div>
      </Transition>

      <!-- Session Info Bar -->
      <div v-if="sesi" class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span class="inline-flex items-center gap-1.5">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {{ sesi.jadwal.jamMulai }} - {{ sesi.jadwal.jamSelesai }}
          </span>
          <span class="inline-flex items-center gap-1.5">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {{ sesi.allSiswa.length }} siswa
          </span>
          <span v-if="sesi.status === 'AKTIF'" class="inline-flex items-center gap-1.5 text-blue-500">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Live — polling setiap 10 detik
          </span>
        </div>
      </div>

      <!-- Status Summary -->
      <div v-if="sesi" class="flex flex-wrap gap-2 mb-4">
        <span class="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">{{ statusCount.HADIR || 0 }} Hadir</span>
        <span class="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-medium">{{ statusCount.SAKIT || 0 }} Sakit</span>
        <span class="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">{{ statusCount.IZIN || 0 }} Izin</span>
        <span class="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">{{ statusCount.ALPHA || 0 }} Alpha</span>
        <span class="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">{{ statusCount.PENDING || 0 }} Menunggu</span>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-6 space-y-4">
          <div v-for="i in 5" :key="i" class="flex items-center gap-4 animate-pulse">
            <div class="h-5 w-5 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded w-40"></div>
            <div class="h-4 bg-gray-200 rounded w-24 ml-auto"></div>
          </div>
        </div>
      </div>

      <!-- Siswa List -->
      <div v-else-if="sesi" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="w-12 px-3 py-3.5"></th>
                <th class="text-left px-3 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Nama</th>
                <th class="text-left px-3 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden sm:table-cell">NISN</th>
                <th class="text-center px-3 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                <th class="text-center px-3 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">Keterangan</th>
                <th class="text-center px-3 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">Scan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="s in sesi.allSiswa" :key="s.id"
                class="hover:bg-gray-50 transition-colors"
                :class="{ 'bg-green-50/40': entries.get(s.id)?.checked && (!s.request || s.request.status === 'PENDING') }">
                <td class="px-3 py-3 text-center">
                  <input type="checkbox"
                    :checked="entries.get(s.id)?.checked || false"
                    @change="toggleSiswa(s.id)"
                    :disabled="sesi.status === 'SELESAI'"
                    class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed" />
                </td>
                <td class="px-3 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {{ s.nama.charAt(0).toUpperCase() }}
                    </div>
                    <span class="font-medium text-gray-900">{{ s.nama }}</span>
                  </div>
                </td>
                <td class="px-3 py-3 text-gray-500 hidden sm:table-cell">{{ s.nisn }}</td>
                <td class="px-3 py-3 text-center">
                  <select v-if="sesi.status === 'AKTIF'"
                    :value="entries.get(s.id)?.status || 'ALPHA'"
                    @change="(e) => setStatus(s.id, (e.target as HTMLSelectElement).value)"
                    class="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer">
                    <option value="HADIR">Hadir</option>
                    <option value="SAKIT">Sakit</option>
                    <option value="IZIN">Izin</option>
                    <option value="ALPHA">Alpha</option>
                  </select>
                  <span v-else :class="statusBadge(entries.get(s.id)?.status || '')">
                    {{ statusLabels[entries.get(s.id)?.status || ''] || entries.get(s.id)?.status }}
                  </span>
                </td>
                <td class="px-3 py-3 text-center hidden md:table-cell">
                  <input v-if="sesi.status === 'AKTIF'"
                    v-model="entries.get(s.id)!.keterangan"
                    type="text" placeholder="-" maxlength="255"
                    class="w-full max-w-[120px] text-xs border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-300" />
                  <span v-else class="text-xs text-gray-400">{{ s.request?.keterangan || '-' }}</span>
                </td>
                <td class="px-3 py-3 text-center hidden md:table-cell">
                  <span v-if="s.request" class="text-xs text-gray-400">
                    {{ new Date(s.request.scannedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
                  </span>
                  <span v-else class="text-xs text-gray-300">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Actions -->
        <div v-if="sesi.status === 'AKTIF'" class="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <p class="text-sm text-gray-500">
            <strong class="text-gray-700">{{ entries.size }}</strong> siswa —
            <strong class="text-green-600">{{ statusCount.HADIR }}</strong> hadir
          </p>
          <button @click="submitKonfirmasi" :disabled="submitting"
            class="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 shadow-sm">
            <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            {{ submitting ? 'Menyimpan...' : 'Konfirmasi Kehadiran' }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.slide-enter-active { transition: all 0.3s ease-out; }
.slide-leave-active { transition: all 0.2s ease-in; }
.slide-enter-from { transform: translateY(-10px); opacity: 0; }
.slide-leave-to { transform: translateY(-10px); opacity: 0; }
</style>
