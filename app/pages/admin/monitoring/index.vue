<script setup lang="ts">
interface MonitoringItem {
  ruangan: string
  sesiAktif: number
  totalSiswa: number
  sudahAbsen: number
  belumAbsen: number
  status: string
}

const { data, pending, refresh } = useFetch<MonitoringItem[]>('/api/admin/monitoring', {
  immediate: true,
  transform: (res: any) => Array.isArray(res) ? res : []
})

const displayData = computed(() => data.value || [])

const totalAktif = computed(() => displayData.value.filter(i => i.status === 'AKTIF').reduce((a, b) => a + b.sesiAktif, 0))
const totalSudahAbsen = computed(() => displayData.value.reduce((a, b) => a + b.sudahAbsen, 0))
const totalBelumAbsen = computed(() => displayData.value.reduce((a, b) => a + b.belumAbsen, 0))

// Auto-refresh every 15 seconds for real-time monitoring
onMounted(() => {
  const interval = setInterval(() => refresh(), 15000)
  onUnmounted(() => clearInterval(interval))
})
</script>

<template>
  <AppLayout>
    <PageHeader title="Monitoring Absensi" description="Pantau sesi absensi secara real-time">
      <template #actions>
        <div class="flex items-center gap-2 text-xs text-gray-500">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Live
        </div>
      </template>
    </PageHeader>

    <LoadingSkeleton v-if="pending" type="table" :rows="4" :columns="6" />

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <StatCard label="Sesi Aktif" :value="totalAktif" variant="green" />
        <StatCard label="Sudah Absen" :value="totalSudahAbsen" variant="blue" />
        <StatCard label="Belum Absen" :value="totalBelumAbsen" variant="amber" />
      </div>

      <BaseCard>
        <div class="overflow-x-auto scrollbar-thin">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Ruangan</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Sesi Aktif</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Total Siswa</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Sudah Absen</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Belum Absen</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in displayData" :key="item.ruangan" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900">{{ item.ruangan }}</td>
                <td class="px-4 py-3 text-center text-gray-700">{{ item.sesiAktif }}</td>
                <td class="px-4 py-3 text-center text-gray-700">{{ item.totalSiswa }}</td>
                <td class="px-4 py-3 text-center text-green-600 font-medium">{{ item.sudahAbsen }}</td>
                <td class="px-4 py-3 text-center text-amber-600 font-medium">{{ item.belumAbsen }}</td>
                <td class="px-4 py-3 text-center">
                  <BaseBadge :variant="item.status === 'AKTIF' ? 'green' : 'gray'" :dot="item.status === 'AKTIF'" :pulse="item.status === 'AKTIF'">
                    {{ item.status }}
                  </BaseBadge>
                </td>
              </tr>
              <tr v-if="displayData.length === 0">
                <td colspan="6" class="px-4 py-16 text-center">
                  <p class="text-gray-500 font-medium">Belum ada data monitoring</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </template>
  </AppLayout>
</template>
