<script setup lang="ts">
interface HistoryItem {
  id: number
  tanggal: string
  mapel: string
  kelas: string
  ruangan: string
  status: string
  ditutupPada: string
  totalSiswa: number
  hadir: number
  sakit: number
  izin: number
  alpha: number
}

const { data: history, pending } = useFetch<HistoryItem[]>('/api/absensi/riwayat', {
  immediate: true
})

// Fallback to mock data if API not ready
const mockHistory: HistoryItem[] = [
  { id: 1, tanggal: '2026-07-27', mapel: 'Matematika', kelas: 'XII-A', ruangan: 'Kelas XII-A', status: 'SELESAI', ditutupPada: '2026-07-27T10:30:00.000Z', totalSiswa: 32, hadir: 30, sakit: 1, izin: 1, alpha: 0 },
  { id: 2, tanggal: '2026-07-27', mapel: 'Fisika', kelas: 'X-A', ruangan: 'Lab Komputer', status: 'SELESAI', ditutupPada: '2026-07-27T09:00:00.000Z', totalSiswa: 28, hadir: 27, sakit: 0, izin: 0, alpha: 1 },
  { id: 3, tanggal: '2026-07-26', mapel: 'Bahasa Inggris', kelas: 'XI-B', ruangan: 'Kelas XI-B', status: 'SELESAI', ditutupPada: '2026-07-26T11:45:00.000Z', totalSiswa: 30, hadir: 29, sakit: 0, izin: 1, alpha: 0 },
  { id: 4, tanggal: '2026-07-26', mapel: 'Bahasa Indonesia', kelas: 'X-C', ruangan: 'Kelas X-C', status: 'SELESAI', ditutupPada: '2026-07-26T12:10:00.000Z', totalSiswa: 30, hadir: 28, sakit: 1, izin: 0, alpha: 1 },
]

const displayData = computed(() => history.value || [])
</script>

<template>
  <PTKLayout>
    <PageHeader title="Riwayat Absensi" description="Riwayat sesi absensi yang telah selesai" :show-back="false" />

    <LoadingSkeleton v-if="pending" type="table" :rows="5" :columns="5" />

    <div v-else class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-card dark:shadow-dark-card overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
            <th class="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs">Tanggal</th>
            <th class="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs">Mapel</th>
            <th class="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs">Kelas</th>
            <th class="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs">Hadir</th>
            <th class="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs">Detail</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
          <tr v-for="item in displayData" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{{ new Date(item.tanggal).toLocaleDateString('id-ID') }}</td>
            <td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 truncate max-w-[10rem]">{{ item.mapel }}</td>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-300 truncate max-w-[6rem]">{{ item.kelas }}</td>
            <td class="px-4 py-3 text-center">
              <span class="font-medium text-green-600 dark:text-green-400">{{ item.hadir }}</span>
            </td>
            <td class="px-4 py-3 text-center">
              <NuxtLink :to="`/absensi/detail/${item.id}`"
                class="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium">
                Lihat
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </NuxtLink>
            </td>
          </tr>
          <tr v-if="displayData.length === 0">
            <td colspan="5" class="px-4 py-16 text-center">
              <p class="text-gray-500 dark:text-gray-400 font-medium">Belum ada riwayat absensi</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </PTKLayout>
</template>
