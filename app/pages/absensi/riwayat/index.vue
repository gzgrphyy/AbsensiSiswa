<script setup lang="ts">
interface HistoryItem {
  id: number
  tanggal: string
  mapel: string
  kelas: string
  ruangan: string
  status: string
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
  { id: 1, tanggal: '2026-07-27', mapel: 'Matematika', kelas: 'XII-A', ruangan: 'Kelas XII-A', status: 'SELESAI', totalSiswa: 32, hadir: 30, sakit: 1, izin: 1, alpha: 0 },
  { id: 2, tanggal: '2026-07-27', mapel: 'Fisika', kelas: 'X-A', ruangan: 'Lab Komputer', status: 'SELESAI', totalSiswa: 28, hadir: 27, sakit: 0, izin: 0, alpha: 1 },
  { id: 3, tanggal: '2026-07-26', mapel: 'Bahasa Inggris', kelas: 'XI-B', ruangan: 'Kelas XI-B', status: 'SELESAI', totalSiswa: 30, hadir: 29, sakit: 0, izin: 1, alpha: 0 },
  { id: 4, tanggal: '2026-07-26', mapel: 'Bahasa Indonesia', kelas: 'X-C', ruangan: 'Kelas X-C', status: 'SELESAI', totalSiswa: 30, hadir: 28, sakit: 1, izin: 0, alpha: 1 },
]

const displayData = computed(() => history.value || [])
</script>

<template>
  <AppLayout>
    <PageHeader title="Riwayat Absensi" description="Riwayat sesi absensi yang telah selesai" />

    <LoadingSkeleton v-if="pending" type="table" :rows="5" :columns="7" />

    <div v-else class="bg-white rounded-lg border border-gray-200 shadow-card overflow-hidden">
      <div class="overflow-x-auto scrollbar-thin">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Tanggal</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Mapel</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden sm:table-cell">Kelas</th>
              <th class="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Total</th>
              <th class="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Hadir</th>
              <th class="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">S/I/A</th>
              <th class="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Detail</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in displayData" :key="item.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 text-gray-700">{{ new Date(item.tanggal).toLocaleDateString('id-ID') }}</td>
              <td class="px-4 py-3 font-medium text-gray-900">{{ item.mapel }}</td>
              <td class="px-4 py-3 text-gray-600 hidden sm:table-cell">{{ item.kelas }}</td>
              <td class="px-4 py-3 text-center text-gray-700">{{ item.totalSiswa }}</td>
              <td class="px-4 py-3 text-center">
                <span class="font-medium text-green-600">{{ item.hadir }}</span>
              </td>
              <td class="px-4 py-3 text-center hidden md:table-cell">
                <span class="text-xs text-gray-500">
                  {{ item.sakit }}/{{ item.izin }}/{{ item.alpha }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <NuxtLink :to="`/absensi/sesi/${item.id}`"
                  class="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                  Lihat
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </NuxtLink>
              </td>
            </tr>
            <tr v-if="displayData.length === 0">
              <td colspan="7" class="px-4 py-16 text-center">
                <p class="text-gray-500 font-medium">Belum ada riwayat absensi</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>
