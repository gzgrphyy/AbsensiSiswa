<script setup lang="ts">
import { statusLabels, statusBadgeVariant } from '~/utils/absensi'

interface RiwayatItem {
  id: number
  tanggal: string
  mapel: string
  kelas: string
  status: string
  keterangan: string | null
  scannedAt: string
}

const { data: riwayat, pending } = useFetch<RiwayatItem[]>('/api/siswa/riwayat', { immediate: true })
</script>

<template>
  <StudentLayout>
    <PageHeader title="Riwayat Absensi" description="Riwayat absensi pribadi" :show-back="false" />

    <LoadingSkeleton v-if="pending" type="table" :rows="5" :columns="4" />

    <div v-else class="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-card dark:shadow-dark-card overflow-hidden">
      <div class="overflow-x-auto scrollbar-thin">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
              <th class="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Tanggal</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Mata Pelajaran</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider hidden sm:table-cell">Kelas</th>
              <th class="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
            <tr v-for="item in riwayat" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
              <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ new Date(item.tanggal).toLocaleDateString('id-ID') }}</td>
              <td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{{ item.mapel }}</td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{{ item.kelas }}</td>
              <td class="px-4 py-3 text-center">
                <BaseBadge :variant="statusBadgeVariant[item.status] || 'gray'">
                  {{ statusLabels[item.status] || item.status }}
                </BaseBadge>
              </td>
            </tr>
            <tr v-if="riwayat.length === 0">
              <td colspan="4" class="px-4 py-16 text-center">
                <p class="text-gray-500 dark:text-gray-400 font-medium">Belum ada riwayat absensi</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </StudentLayout>
</template>
