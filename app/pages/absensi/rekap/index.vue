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

const displayData = computed(() => data.value || [])

const totalHadir = computed(() => displayData.value.reduce((a, b) => a + b.hadir, 0))
const totalSiswa = computed(() => displayData.value.reduce((a, b) => a + b.totalSiswa, 0))
const rataPersentase = computed(() =>
  displayData.value.length ? (displayData.value.reduce((a, b) => a + b.persentase, 0) / displayData.value.length).toFixed(1) : '0'
)
</script>

<template>
  <PTKLayout>
    <PageHeader title="Rekap Absensi" description="Rekapitulasi kehadiran berdasarkan jadwal" :show-back="false">
      <template #actions>
        <NuxtLink
          to="/absensi/export"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary-500 rounded-xl hover:bg-primary-600 active:bg-primary-700 transition-colors shadow-md shadow-primary-500/30"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export
        </NuxtLink>
      </template>
    </PageHeader>

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
              <tr class="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
                <th class="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Mata Pelajaran</th>
                <th class="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider hidden sm:table-cell">Kelas</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Total</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Hadir</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider hidden md:table-cell">S/I/A</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">%</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
              <tr v-for="item in displayData" :key="item.mapel + item.kelas" class="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{{ item.mapel }}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">{{ item.kelas }}</td>
                <td class="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{{ item.totalSiswa }}</td>
                <td class="px-4 py-3 text-center text-green-600 dark:text-green-400 font-medium">{{ item.hadir }}</td>
                <td class="px-4 py-3 text-center text-gray-500 dark:text-gray-400 text-xs hidden md:table-cell">{{ item.sakit }}/{{ item.izin }}/{{ item.alpha }}</td>
                <td class="px-4 py-3 text-center font-semibold" :class="item.persentase >= 90 ? 'text-green-600' : item.persentase >= 75 ? 'text-amber-600' : 'text-red-600'">{{ item.persentase }}%</td>
              </tr>
              <tr v-if="displayData.length === 0">
                <td colspan="6" class="px-4 py-16 text-center">
                  <p class="text-gray-500 dark:text-gray-400 font-medium">Belum ada data rekap</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </template>
  </PTKLayout>
</template>
