<script setup lang="ts">
interface MonitoringItem {
  ruangan: string
  sesiAktif: number
  totalSiswa: number
  sudahAbsen: number
  belumAbsen: number
  status: string
}

const { data, pending } = useFetch<MonitoringItem[]>('/api/admin/monitoring', {
  immediate: true,
  transform: (res: any) => res || []
})

const mockData: MonitoringItem[] = [
  { ruangan: 'Kelas X-A', sesiAktif: 1, totalSiswa: 30, sudahAbsen: 28, belumAbsen: 2, status: 'AKTIF' },
  { ruangan: 'Kelas XI-B', sesiAktif: 2, totalSiswa: 30, sudahAbsen: 25, belumAbsen: 5, status: 'AKTIF' },
  { ruangan: 'Lab Komputer', sesiAktif: 1, totalSiswa: 28, sudahAbsen: 27, belumAbsen: 1, status: 'AKTIF' },
  { ruangan: 'Kelas XII-A', sesiAktif: 0, totalSiswa: 32, sudahAbsen: 0, belumAbsen: 0, status: 'TIDAK AKTIF' },
]

const displayData = computed(() => (data.value?.length ? data.value : mockData))

const totalAktif = computed(() => displayData.value.filter(i => i.status === 'AKTIF').reduce((a, b) => a + b.sesiAktif, 0))
const totalSudahAbsen = computed(() => displayData.value.reduce((a, b) => a + b.sudahAbsen, 0))
const totalBelumAbsen = computed(() => displayData.value.reduce((a, b) => a + b.belumAbsen, 0))
</script>

<template>
  <AppLayout>
    <PageHeader title="Monitoring Absensi" description="Pantau sesi absensi secara real-time" />

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
                  <BaseBadge :variant="item.status === 'AKTIF' ? 'green' : 'gray'">
                    {{ item.status }}
                  </BaseBadge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </template>
  </AppLayout>
</template>
