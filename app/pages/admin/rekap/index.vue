<script setup lang="ts">
interface RekapItem {
  kelas: string
  totalSiswa: number
  hadir: number
  sakit: number
  izin: number
  alpha: number
  pending: number
  persentase: number
}

const { t } = useI18n()

const currentBulan = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const selectedBulan = ref(currentBulan())
const selectedTa = ref<number | ''>('')
const selectedKelas = ref<number | ''>('')

const appliedBulan = ref(currentBulan())
const appliedTa = ref<number | ''>('')
const appliedKelas = ref<number | ''>('')

const { data: taList } = useFetch<{ id: number; nama: string; semester: string; isActive: boolean }[]>('/api/admin/tahun-ajaran', { immediate: true })

const semesterLabel = (s: string) => s === 'GANJIL' ? t('semester.ganjil') : t('semester.genap')

function activeTaId() {
  return taList.value?.find(t => t.isActive)?.id ?? ''
}

// Default tahun ajaran = tahun ajaran yang aktif (isActive).
// Kelas default-nya nanti dipilih lewat watcher kelasList.
watch(
  taList,
  (list) => {
    if (!list?.some(t => t.isActive)) return
    if (appliedTa.value !== '') return
    selectedTa.value = activeTaId()
    appliedTa.value = activeTaId()
    selectedKelas.value = ''
    appliedKelas.value = ''
  },
  { immediate: true }
)

const kelasQuery = computed(() => ({
  ...(selectedTa.value ? { tahunAjaranId: selectedTa.value } : {})
}))

const { data: kelasList, refresh: refreshKelas } = useFetch<{ id: number; nama: string; tahunAjaranId: number }[]>('/api/admin/kelas', {
  query: kelasQuery,
  immediate: true
})

// Default kelas = kelas pertama dari daftar yang sedang aktif.
// Saat tahun ajaran berubah, draft kelas ikut di-reset ke kelas pertama daftar barunya.
watch(
  kelasList,
  (list) => {
    if (!list?.length) return
    selectedKelas.value = list[0].id
    // Terapkan default kelas hanya jika daftar ini sesuai tahun ajaran yang dipakai
    if (!appliedKelas.value && (!appliedTa.value || list[0].tahunAjaranId === appliedTa.value)) {
      appliedKelas.value = list[0].id
    }
  },
  { immediate: true }
)

const queryParams = computed(() => ({
  ...(appliedBulan.value ? { bulan: appliedBulan.value } : {}),
  ...(appliedTa.value ? { tahunAjaranId: appliedTa.value } : {}),
  ...(appliedKelas.value ? { kelasId: appliedKelas.value } : {}),
}))

const { data, pending } = useFetch<RekapItem[]>('/api/admin/rekap', {
  query: queryParams,
  immediate: true,
  transform: (res: any) => Array.isArray(res) ? res : []
})

// Terapkan filter: salin nilai draft ke nilai applied (useFetch otomatis refetch)
function applyFilter() {
  appliedBulan.value = selectedBulan.value
  appliedTa.value = selectedTa.value
  appliedKelas.value = selectedKelas.value
}

// Atur Ulang: kembalikan ke default (tahun ajaran aktif, bulan berjalan, kelas pertama) lalu terapkan langsung
// refreshKelas() memastikan watcher kelasList dijalankan dan kelas pertama dipakai sebagai default.
async function resetFilter() {
  const defaultTa = activeTaId()
  selectedBulan.value = currentBulan()
  selectedTa.value = defaultTa
  selectedKelas.value = ''
  appliedBulan.value = currentBulan()
  appliedTa.value = defaultTa
  appliedKelas.value = ''

  await refreshKelas()
}

const displayData = computed(() => (Array.isArray(data.value) ? data.value : []))

const bulanOptions = computed(() => {
  const options = []
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
    options.push({ value, label })
  }
  return options
})

const totalHadir = computed(() => displayData.value.reduce((a, b) => a + b.hadir, 0))
const totalSiswa = computed(() => displayData.value.reduce((a, b) => a + b.totalSiswa, 0))
const totalSakit = computed(() => displayData.value.reduce((a, b) => a + b.sakit, 0))
const totalIzin = computed(() => displayData.value.reduce((a, b) => a + b.izin, 0))
const totalAlpha = computed(() => displayData.value.reduce((a, b) => a + b.alpha, 0))
const totalPending = computed(() => displayData.value.reduce((a, b) => a + b.pending, 0))
const rataPersentase = computed(() =>
  displayData.value.length ? (displayData.value.reduce((a, b) => a + b.persentase, 0) / displayData.value.length).toFixed(1) : 0
)
</script>

<template>
  <AppLayout>
    <PageHeader :title="t('admin.rekap.title')" :description="t('admin.rekap.desc')" />

    <div class="flex flex-wrap items-end gap-3 mb-5">
      <!-- Filter: Tahun Ajaran -->
      <div class="flex flex-col gap-1 min-w-[180px]">
        <label class="text-xs  text-gray-500">{{ t('admin.rekap.labelTa') }}</label>
        <select v-model="selectedTa"
          class="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option :value="''">{{ t('admin.kelas.semuaTa') }}</option>
          <option v-for="t in taList" :key="t.id" :value="t.id">{{ t.nama }} ({{ semesterLabel(t.semester) }})</option>
        </select>
      </div>

      <!-- Filter: Kelas -->
      <div class="flex flex-col gap-1 min-w-[160px]">
        <label class="text-xs  text-gray-500">{{ t('admin.rekap.labelKelas') }}</label>
        <select v-model="selectedKelas"
          class="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option :value="''">{{ t('admin.jadwal.semuaKelas') }}</option>
          <option v-for="k in kelasList" :key="k.id" :value="k.id">{{ k.nama }}</option>
        </select>
      </div>

      <!-- Filter: Periode Bulan -->
      <div class="flex flex-col gap-1 min-w-[180px]">
        <label class="text-xs  text-gray-500">{{ t('admin.rekap.labelPeriode') }}</label>
        <select v-model="selectedBulan"
          class="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">{{ t('admin.rekap.semuaPeriode') }}</option>
          <option v-for="o in bulanOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>

      <!-- Tombol Terapkan -->
      <button @click="applyFilter()"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md border border-blue-600 transition-colors">
        {{ t('common.terapkan') }}
      </button>

      <!-- Tombol Reset -->
      <button @click="resetFilter()"
        class="px-3 py-2 text-sm  text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md border border-gray-300 dark:border-slate-600 transition-colors">
        {{ t('common.aturUlang') }}
      </button>
    </div>

    <LoadingSkeleton v-if="pending" type="table" :rows="6" :columns="8" />

    <template v-else>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-5">
        <StatCard :label="t('admin.rekap.statTotalMurid')" :value="totalSiswa" variant="blue" />
        <StatCard :label="t('admin.rekap.statHadir')" :value="totalHadir" variant="green" />
        <StatCard :label="t('admin.rekap.statPending')" :value="totalPending" variant="gray" />
        <StatCard :label="t('admin.rekap.statSakit')" :value="totalSakit" variant="amber" />
        <StatCard :label="t('admin.rekap.statIzin')" :value="totalIzin" variant="blue" />
        <StatCard :label="t('admin.rekap.statAlpha')" :value="totalAlpha" variant="red" />
        <StatCard :label="t('admin.rekap.statRata')" :value="rataPersentase + '%'" variant="green" />
      </div>

      <BaseCard>
        <div class="overflow-x-auto scrollbar-thin">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
                <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.rekap.colKelas') }}</th>
                <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.rekap.colTotalMurid') }}</th>
                <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.rekap.colHadir') }}</th>
                <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.rekap.colPending') }}</th>
                <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.rekap.colSakit') }}</th>
                <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.rekap.colIzin') }}</th>
                <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.rekap.colAlpha') }}</th>
                <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.rekap.colPersentase') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
              <tr v-for="item in displayData" :key="item.kelas" class="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <td class="px-4 py-3  text-gray-900 dark:text-gray-100">{{ item.kelas }}</td>
                <td class="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{{ item.totalSiswa }}</td>
                <td class="px-4 py-3 text-center text-green-600 dark:text-green-400 ">{{ item.hadir }}</td>
                <td class="px-4 py-3 text-center text-gray-500 dark:text-gray-400">{{ item.pending }}</td>
                <td class="px-4 py-3 text-center text-amber-600 dark:text-amber-400">{{ item.sakit }}</td>
                <td class="px-4 py-3 text-center text-blue-600 dark:text-blue-400">{{ item.izin }}</td>
                <td class="px-4 py-3 text-center text-red-600 dark:text-red-400">{{ item.alpha }}</td>
                <td class="px-4 py-3 text-center " :class="item.persentase >= 90 ? 'text-green-600 dark:text-green-400' : item.persentase >= 75 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'">{{ item.persentase }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </template>
  </AppLayout>
</template>
