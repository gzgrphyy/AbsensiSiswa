<script setup lang="ts">
interface RiwayatItem {
  id: number
  tanggal: string
  mapel: string
  kelas: string
  status: string
  keterangan: string | null
  scannedAt: string
}

const { data: statusData, pending } = useFetch<any>('/api/siswa/status', { immediate: true })

const riwayat = computed<RiwayatItem[]>(() => statusData.value?.recentHistory || [])

const statusLabels: Record<string, string> = {
  PENDING: 'Menunggu',
  HADIR: 'Hadir',
  SAKIT: 'Sakit',
  IZIN: 'Izin',
  ALPHA: 'Alpha'
}

const statusBadgeVariant: Record<string, string> = {
  PENDING: 'amber',
  HADIR: 'green',
  SAKIT: 'red',
  IZIN: 'blue',
  ALPHA: 'gray'
}
</script>

<template>
  <AppLayout>
    <PageHeader title="Riwayat Absensi" description="Riwayat absensi pribadi" />

    <LoadingSkeleton v-if="pending" type="table" :rows="5" :columns="4" />

    <div v-else class="bg-white rounded-lg border border-gray-200 shadow-card overflow-hidden">
      <div class="overflow-x-auto scrollbar-thin">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Tanggal</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Mata Pelajaran</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden sm:table-cell">Kelas</th>
              <th class="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in riwayat" :key="item.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 text-gray-700">{{ new Date(item.tanggal).toLocaleDateString('id-ID') }}</td>
              <td class="px-4 py-3 font-medium text-gray-900">{{ item.mapel }}</td>
              <td class="px-4 py-3 text-gray-600 hidden sm:table-cell">{{ item.kelas }}</td>
              <td class="px-4 py-3 text-center">
                <BaseBadge :variant="statusBadgeVariant[item.status] || 'gray'">
                  {{ statusLabels[item.status] || item.status }}
                </BaseBadge>
              </td>
            </tr>
            <tr v-if="riwayat.length === 0">
              <td colspan="4" class="px-4 py-16 text-center">
                <p class="text-gray-500 font-medium">Belum ada riwayat absensi</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>
