<script setup lang="ts">
interface RekapItem {
  mapel: string
  kelas: string
  totalSiswa: number
  hadir: number
  sakit: number
  izin: number
  alpha: number
  persentase: number
}

const { data, pending } = useFetch<RekapItem[]>('/api/absensi/rekap', {
  immediate: true,
  transform: (res: any) => res || []
})

const mockData: RekapItem[] = [
  { mapel: 'Matematika', kelas: 'XII-A', totalSiswa: 32, hadir: 30, sakit: 1, izin: 1, alpha: 0, persentase: 93.8 },
  { mapel: 'Fisika', kelas: 'X-A', totalSiswa: 28, hadir: 27, sakit: 0, izin: 0, alpha: 1, persentase: 96.4 },
  { mapel: 'Bahasa Inggris', kelas: 'XI-B', totalSiswa: 30, hadir: 29, sakit: 0, izin: 1, alpha: 0, persentase: 96.7 },
  { mapel: 'Bahasa Indonesia', kelas: 'X-C', totalSiswa: 30, hadir: 28, sakit: 1, izin: 0, alpha: 1, persentase: 93.3 },
]

const displayData = computed(() => (data.value?.length ? data.value : mockData))

const totalHadir = computed(() => displayData.value.reduce((a, b) => a + b.hadir, 0))
const totalSiswa = computed(() => displayData.value.reduce((a, b) => a + b.totalSiswa, 0))
const rataPersentase = computed(() =>
  displayData.value.length ? (displayData.value.reduce((a, b) => a + b.persentase, 0) / displayData.value.length).toFixed(1) : '0'
)
</script>

<template>
  <AppLayout>
    <PageHeader title="Rekap Absensi" description="Rekapitulasi kehadiran berdasarkan jadwal" />

    <LoadingSkeleton v-if="pending" type="table" :rows="4" :columns="7" />

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <StatCard label="Total Sesi" :value="displayData.length" variant="blue" />
        <StatCard label="Total Hadir" :value="totalHadir" variant="green" />
        <StatCard label="Rata-rata %" :value="rataPersentase + '%'" variant="green" />
      </div>

      <BaseCard>
        <div class="overflow-x-auto scrollbar-thin">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Mata Pelajaran</th>
                <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden sm:table-cell">Kelas</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Total</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Hadir</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">S/I/A</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">%</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in displayData" :key="item.mapel + item.kelas" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900">{{ item.mapel }}</td>
                <td class="px-4 py-3 text-gray-600 hidden sm:table-cell">{{ item.kelas }}</td>
                <td class="px-4 py-3 text-center text-gray-700">{{ item.totalSiswa }}</td>
                <td class="px-4 py-3 text-center text-green-600 font-medium">{{ item.hadir }}</td>
                <td class="px-4 py-3 text-center text-gray-500 text-xs hidden md:table-cell">{{ item.sakit }}/{{ item.izin }}/{{ item.alpha }}</td>
                <td class="px-4 py-3 text-center font-semibold" :class="item.persentase >= 90 ? 'text-green-600' : item.persentase >= 75 ? 'text-amber-600' : 'text-red-600'">{{ item.persentase }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </template>
  </AppLayout>
</template>
