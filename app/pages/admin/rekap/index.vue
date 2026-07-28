<script setup lang="ts">
interface RekapItem {
  kelas: string
  totalSiswa: number
  hadir: number
  sakit: number
  izin: number
  alpha: number
  persentase: number
}

const selectedBulan = ref(new Date().toISOString().slice(0, 7))
const selectedTa = ref<number | ''>('')
const selectedKelas = ref<number | ''>('')

const { data: taList } = useFetch<{ id: number; nama: string; semester: string }[]>('/api/admin/tahun-ajaran', { immediate: true })

const kelasQuery = computed(() => ({
  ...(selectedTa.value ? { tahunAjaranId: selectedTa.value } : {})
}))

const { data: kelasList, refresh: refreshKelas } = useFetch<{ id: number; nama: string; tahunAjaranId: number }[]>('/api/admin/kelas', {
  query: kelasQuery,
  immediate: true
})

// Reset selected kelas when tahun ajaran changes
watch(selectedTa, () => {
  selectedKelas.value = ''
})

const queryParams = computed(() => ({
  bulan: selectedBulan.value,
  ...(selectedTa.value ? { tahunAjaranId: selectedTa.value } : {}),
  ...(selectedKelas.value ? { kelasId: selectedKelas.value } : {}),
}))

const { data, pending, refresh } = useFetch<RekapItem[]>('/api/admin/rekap', {
  query: queryParams,
  immediate: true,
  transform: (res: any) => Array.isArray(res) ? res : []
})

watch([selectedBulan, selectedTa, selectedKelas], () => refresh())

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
const rataPersentase = computed(() =>
  displayData.value.length ? (displayData.value.reduce((a, b) => a + b.persentase, 0) / displayData.value.length).toFixed(1) : 0
)
</script>

<template>
  <AppLayout>
    <PageHeader title="Rekap Absensi" description="Rekapitulasi kehadiran per kelas" />

    <div class="flex flex-wrap items-end gap-3 mb-5">
      <!-- Filter: Tahun Ajaran -->
      <div class="flex flex-col gap-1 min-w-[180px]">
        <label class="text-xs font-medium text-gray-500">Tahun Ajaran</label>
        <select v-model="selectedTa"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
          <option :value="''">Semua Tahun Ajaran</option>
          <option v-for="t in taList" :key="t.id" :value="t.id">{{ t.nama }} ({{ t.semester }})</option>
        </select>
      </div>

      <!-- Filter: Kelas -->
      <div class="flex flex-col gap-1 min-w-[160px]">
        <label class="text-xs font-medium text-gray-500">Kelas</label>
        <select v-model="selectedKelas"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
          <option :value="''">Semua Kelas</option>
          <option v-for="k in kelasList" :key="k.id" :value="k.id">{{ k.nama }}</option>
        </select>
      </div>

      <!-- Filter: Periode Bulan -->
      <div class="flex flex-col gap-1 min-w-[180px]">
        <label class="text-xs font-medium text-gray-500">Periode</label>
        <select v-model="selectedBulan"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
          <option v-for="o in bulanOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>

      <!-- Tombol Reset -->
      <button @click="selectedTa = ''; selectedKelas = ''"
        class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors">
        Reset Filter
      </button>
    </div>

    <LoadingSkeleton v-if="pending" type="table" :rows="6" :columns="7" />

    <template v-else>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <StatCard label="Total Siswa" :value="totalSiswa" variant="blue" />
        <StatCard label="Hadir" :value="totalHadir" variant="green" />
        <StatCard label="Sakit" :value="totalSakit" variant="amber" />
        <StatCard label="Izin" :value="totalIzin" variant="blue" />
        <StatCard label="Alpha" :value="totalAlpha" variant="red" />
        <StatCard label="Rata-rata %" :value="rataPersentase + '%'" variant="green" />
      </div>

      <BaseCard>
        <div class="overflow-x-auto scrollbar-thin">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Kelas</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Total Siswa</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Hadir</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Sakit</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Izin</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Alpha</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">% Kehadiran</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in displayData" :key="item.kelas" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900">{{ item.kelas }}</td>
                <td class="px-4 py-3 text-center text-gray-700">{{ item.totalSiswa }}</td>
                <td class="px-4 py-3 text-center text-green-600 font-medium">{{ item.hadir }}</td>
                <td class="px-4 py-3 text-center text-amber-600">{{ item.sakit }}</td>
                <td class="px-4 py-3 text-center text-blue-600">{{ item.izin }}</td>
                <td class="px-4 py-3 text-center text-red-600">{{ item.alpha }}</td>
                <td class="px-4 py-3 text-center font-semibold" :class="item.persentase >= 90 ? 'text-green-600' : item.persentase >= 75 ? 'text-amber-600' : 'text-red-600'">{{ item.persentase }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </template>
  </AppLayout>
</template>
