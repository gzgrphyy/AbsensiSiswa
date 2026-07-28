<script setup lang="ts">
interface DashboardData {
  jumlahPtk: number
  jumlahMurid: number
  jumlahKelas: number
  totalRuangan: number
  ruanganAktif: number
  hadir: number
  sakit: number
  izin: number
  alpha: number
  persentase: number
  topAlpha: { nama: string; kelas: string; totalAlpha: number }[]
  monitoring: { ruangan: string; status: string; sesi: string; ptk: string }[]
  aktivitasTerbaru: { waktu: string; aksi: string; detail: string }[]
}

const { data, pending } = useFetch<DashboardData>('/api/admin/dashboard', { immediate: true })
</script>

<template>
  <AppLayout>
    <PageHeader title="Dasbor Admin" description="Ikhtisar sistem absensi sekolah" :show-back="false" />

    <LoadingSkeleton v-if="pending" type="table" :rows="5" :columns="5" />

    <template v-else-if="data">
      <!-- Row 1: Data Master & Fasilitas -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
        <StatCard label="Jumlah PTK" :value="data.jumlahPtk" variant="purple">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </template>
        </StatCard>

        <StatCard label="Jumlah Murid" :value="data.jumlahMurid" variant="green">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5zm0-7l-9-5 9-5 9 5-9 5z" />
            </svg>
          </template>
        </StatCard>

        <StatCard label="Jumlah Kelas" :value="data.jumlahKelas" variant="purple">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </template>
        </StatCard>

        <StatCard label="Total Ruangan" :value="data.totalRuangan" variant="amber">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </template>
        </StatCard>

        <StatCard label="Ruangan Aktif" :value="data.ruanganAktif" variant="primary">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </template>
        </StatCard>
      </div>

      <!-- Row 2: Kehadiran Hari Ini -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
        <StatCard label="Hadir" :value="data.hadir" variant="green">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </template>
        </StatCard>

        <StatCard label="Sakit" :value="data.sakit" variant="red">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </template>
        </StatCard>

        <StatCard label="Izin" :value="data.izin" variant="purple">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </template>
        </StatCard>

        <StatCard label="Alpha" :value="data.alpha" variant="gray">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </template>
        </StatCard>

        <StatCard label="Persentase" :value="`${data.persentase}%`" variant="primary">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </template>
        </StatCard>
      </div>

      <!-- Tables Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <!-- Top Alpha Siswa -->
        <div class="bg-white dark:bg-gray-800 rounded-sm border border-gray-300 dark:border-gray-600">
          <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Murid Alpha Terbanyak</h3>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Periode bulan ini</p>
            </div>
            <span class="text-xs text-gray-400 dark:text-gray-500 font-medium bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-sm">{{ data.topAlpha.length }} murid</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 dark:bg-slate-700/50">
                  <th class="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Nama</th>
                  <th class="text-center px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Kelas</th>
                  <th class="text-center px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Total Alpha</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="(item, idx) in data.topAlpha" :key="idx" class="hover:bg-gray-50/40 dark:hover:bg-gray-700/30 transition-colors">
                  <td class="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">{{ item.nama }}</td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-400 text-center">{{ item.kelas }}</td>
                  <td class="px-4 py-3 text-center">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800">{{ item.totalAlpha }}x</span>
                  </td>
                </tr>
                <tr v-if="data.topAlpha.length === 0">
                  <td colspan="3" class="px-4 py-12 text-center text-gray-400 dark:text-gray-500 text-sm">Belum ada data</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Monitoring Ruangan -->
        <div class="bg-white dark:bg-gray-800 rounded-sm border border-gray-300 dark:border-gray-600">
          <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Pemantauan Ruangan</h3>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Status ruangan terkini</p>
            </div>
            <BaseBadge variant="green" dot size="sm">{{ data.monitoring.filter(r => r.status === 'Aktif').length }} Aktif</BaseBadge>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 dark:bg-slate-700/50">
                  <th class="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Ruangan</th>
                  <th class="text-center px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Status</th>
                  <th class="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Sesi</th>
                  <th class="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider hidden md:table-cell">PTK</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="(item, idx) in data.monitoring" :key="idx" class="hover:bg-gray-50/40 dark:hover:bg-gray-700/30 transition-colors">
                  <td class="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">{{ item.ruangan }}</td>
                  <td class="px-4 py-3 text-center">
                    <BaseBadge
                      :variant="item.status === 'Aktif' ? 'green' : 'gray'"
                      :dot="item.status === 'Aktif'"
                      :pulse="item.status === 'Aktif'"
                    >
                      {{ item.status }}
                    </BaseBadge>
                  </td>
                  <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ item.sesi }}</td>
                  <td class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell">{{ item.ptk }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Aktivitas Terbaru -->
      <div class="bg-white dark:bg-gray-800 rounded-sm border border-gray-300 dark:border-gray-600">
        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Aktivitas Terbaru</h3>
          <span class="text-xs text-gray-400 dark:text-gray-500">Hari ini</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-slate-700/50">
                <th class="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider w-20">Waktu</th>
                <th class="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Aksi</th>
                <th class="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Detail</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="(item, idx) in data.aktivitasTerbaru" :key="idx" class="hover:bg-gray-50/40 dark:hover:bg-gray-700/30 transition-colors">
                <td class="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs font-mono">{{ item.waktu }}</td>
                <td class="px-4 py-3">
                  <BaseBadge
                    :variant="item.aksi.includes('dibuka') ? 'green' : 'gray'"
                    size="sm"
                  >
                    {{ item.aksi }}
                  </BaseBadge>
                </td>
                <td class="px-5 py-3 text-gray-700 dark:text-gray-300">{{ item.detail }}</td>
              </tr>
              <tr v-if="data.aktivitasTerbaru.length === 0">
                <td colspan="3" class="px-4 py-12 text-center text-gray-400 dark:text-gray-500 text-sm">Belum ada aktivitas hari ini</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </AppLayout>
</template>
