<script setup lang="ts">
const { t } = useI18n()

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

function statusLabel(status: string) {
  if (status === 'Aktif' || status === 'Tidak Aktif') return t(`admin.beranda.status.${status}`)
  return status
}

function aksiLabel(aksi: string) {
  return aksi.includes('dibuka') ? t('admin.beranda.aksiDibuka') : t('admin.beranda.aksiDitutup')
}
</script>

<template>
  <AppLayout>
    <PageHeader :title="t('admin.beranda.title')" :description="t('admin.beranda.desc')" :show-back="false">
      <template #actions>
        <div class="flex items-center gap-3 text-xs text-gray-500 self-end pb-0.5">
          <div class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            {{ t('admin.beranda.langsung') }}
          </div>
          <span class="text-[10px] px-1.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 ">{{ t('admin.beranda.hariIni') }}</span>
        </div>
      </template>
    </PageHeader>

    <LoadingSkeleton v-if="pending" type="table" :rows="5" :columns="5" />

    <template v-else-if="data">
      <!-- Row 1: Data Master & Fasilitas -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
        <StatCard :label="t('admin.beranda.statJumlahPtk')" :value="data.jumlahPtk" variant="purple">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </template>
        </StatCard>

        <StatCard :label="t('admin.beranda.statJumlahMurid')" :value="data.jumlahMurid" variant="green">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5zm0-7l-9-5 9-5 9 5-9 5z" />
            </svg>
          </template>
        </StatCard>

        <StatCard :label="t('admin.beranda.statJumlahKelas')" :value="data.jumlahKelas" variant="purple">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </template>
        </StatCard>

        <StatCard :label="t('admin.beranda.statTotalRuangan')" :value="data.totalRuangan" variant="amber">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </template>
        </StatCard>

        <StatCard :label="t('admin.beranda.statRuanganAktif')" :value="data.ruanganAktif" variant="primary">
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
        <StatCard :label="t('admin.beranda.statHadir')" :value="data.hadir" variant="green">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </template>
        </StatCard>

        <StatCard :label="t('admin.beranda.statSakit')" :value="data.sakit" variant="red">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </template>
        </StatCard>

        <StatCard :label="t('admin.beranda.statIzin')" :value="data.izin" variant="purple">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </template>
        </StatCard>

        <StatCard :label="t('admin.beranda.statAlpha')" :value="data.alpha" variant="gray">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </template>
        </StatCard>

        <StatCard :label="t('admin.beranda.statPersentase')" :value="`${data.persentase}%`" variant="primary">
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
        <div class="bg-white dark:bg-gray-800 rounded-lg border admin-accent-border">
          <div class="px-4 py-3 border-b admin-accent-border flex items-center justify-between">
            <div>
              <h3 class="text-sm font text-gray-900 dark:text-gray-100">{{ t('admin.beranda.topAlphaTitle') }}</h3>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ t('admin.beranda.topAlphaDesc') }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-400 dark:text-gray-200  bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg">{{ data.topAlpha.length }} {{ t('admin.beranda.unitMurid') }}</span>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 dark:bg-slate-700/50">
                  <th class="text-left px-4 py-3  text-gray-500 dark:text-gray-400 text-xs tracking-wider">{{ t('admin.beranda.colNama') }}</th>
                  <th class="text-center px-4 py-3  text-gray-500 dark:text-gray-400 text-xs tracking-wider">{{ t('admin.beranda.colKelas') }}</th>
                  <th class="text-center px-4 py-3  text-gray-500 dark:text-gray-400 text-xs tracking-wider">{{ t('admin.beranda.colTotalAlpha') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y admin-accent-divide">
                <tr v-for="(item, idx) in data.topAlpha" :key="idx" class="hover:bg-gray-50/40 dark:hover:bg-gray-700/30 transition-colors">
                  <td class="px-4 py-3 text-gray-900 dark:text-gray-100 ">{{ item.nama }}</td>
                  <td class="px-4 py-3 text-gray-600 dark:text-gray-400 text-center">{{ item.kelas }}</td>
                  <td class="px-4 py-3 text-center">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-xs  bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800">{{ item.totalAlpha }}x</span>
                  </td>
                </tr>
                <tr v-if="data.topAlpha.length === 0">
                  <td colspan="3" class="px-4 py-12 text-center text-gray-400 dark:text-gray-500 text-sm">{{ t('common.belumAdaData') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="px-4 py-3 border-t admin-accent-border flex items-center justify-between gap-3">
            <NuxtLink
              to="/admin/alpha"
              class="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs  text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 ring-1 ring-primary-200 dark:ring-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/60 transition-colors"
            >
              {{ t('admin.beranda.lihatSelengkapnya') }}
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </div>

        <!-- Monitoring Ruangan -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border admin-accent-border">
          <div class="px-4 py-3 border-b admin-accent-border flex items-center justify-between">
            <div>
              <h3 class="text-sm font text-gray-900 dark:text-gray-100">{{ t('admin.beranda.monitoringTitle') }}</h3>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ t('admin.beranda.monitoringDesc') }}</p>
            </div>
            <BaseBadge variant="green" dot size="sm">{{ data.monitoring.filter(r => r.status === 'Aktif').length }} {{ t('admin.beranda.unitAktif') }}</BaseBadge>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 dark:bg-slate-700/50">
                  <th class="text-left px-4 py-3  text-gray-500 dark:text-gray-400 text-xs tracking-wider">{{ t('admin.beranda.colRuangan') }}</th>
                  <th class="text-center px-4 py-3  text-gray-500 dark:text-gray-400 text-xs tracking-wider">{{ t('admin.beranda.colStatus') }}</th>
                  <th class="text-left px-4 py-3  text-gray-500 dark:text-gray-400 text-xs tracking-wider">{{ t('admin.beranda.colSesi') }}</th>
                  <th class="text-left px-4 py-3  text-gray-500 dark:text-gray-400 text-xs tracking-wider hidden md:table-cell">{{ t('admin.beranda.colPtk') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y admin-accent-divide">
                <tr v-for="(item, idx) in data.monitoring.slice(0, 5)" :key="idx" class="hover:bg-gray-50/40 dark:hover:bg-gray-700/30 transition-colors">
                  <td class="px-4 py-3 text-gray-900 dark:text-gray-100 ">{{ item.ruangan }}</td>
                  <td class="px-4 py-3 text-center">
                    <BaseBadge
                      :variant="item.status === 'Aktif' ? 'green' : 'gray'"
                      :dot="item.status === 'Aktif'"
                      :pulse="item.status === 'Aktif'"
                    >
                      {{ statusLabel(item.status) }}
                    </BaseBadge>
                  </td>
                  <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ item.sesi }}</td>
                  <td class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell">{{ item.ptk }}</td>
                </tr>
                <tr v-if="data.monitoring.length === 0">
                  <td colspan="4" class="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">{{ t('common.belumAdaData') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="px-4 py-3 border-t admin-accent-border flex items-center justify-between gap-3">
            <p v-if="data.monitoring.length > 5" class="text-xs text-gray-400 dark:text-gray-500">
              {{ t('admin.beranda.ruanganLainnya', { count: data.monitoring.length - 5 }) }}
            </p>
            <NuxtLink
              to="/admin/monitoring"
              class="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs  text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 ring-1 ring-primary-200 dark:ring-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/60 transition-colors"
            >
              {{ t('admin.beranda.lihatSelengkapnya') }}
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Aktivitas Terbaru -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border admin-accent-border">
        <div class="px-4 py-3 border-b admin-accent-border flex items-center justify-between">
          <h3 class="text-sm font text-gray-900 dark:text-gray-100">{{ t('admin.beranda.aktivitasTitle') }}</h3>
          <span class="text-xs text-gray-400 dark:text-gray-200  bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg">{{ data.aktivitasTerbaru.length }} {{ t('admin.beranda.unitAktivitas') }}</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-slate-700/50">
                <th class="text-left px-4 py-3  text-gray-500 dark:text-gray-400 text-xs tracking-wider w-20">{{ t('admin.beranda.colWaktu') }}</th>
                <th class="text-left px-4 py-3  text-gray-500 dark:text-gray-400 text-xs tracking-wider">{{ t('admin.beranda.colAksi') }}</th>
                <th class="text-left px-4 py-3  text-gray-500 dark:text-gray-400 text-xs tracking-wider">{{ t('admin.beranda.colDetail') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y admin-accent-divide">
              <tr v-for="(item, idx) in data.aktivitasTerbaru" :key="idx" class="hover:bg-gray-50/40 dark:hover:bg-gray-700/30 transition-colors">
                <td class="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs font-mono">{{ item.waktu }}</td>
                <td class="px-4 py-3">
                  <BaseBadge
                    :variant="item.aksi.includes('dibuka') ? 'green' : 'gray'"
                    size="sm"
                  >
                    {{ aksiLabel(item.aksi) }}
                  </BaseBadge>
                </td>
                <td class="px-5 py-3 text-gray-700 dark:text-gray-300">{{ item.detail }}</td>
              </tr>
              <tr v-if="data.aktivitasTerbaru.length === 0">
                <td colspan="3" class="px-4 py-12 text-center text-gray-400 dark:text-gray-500 text-sm">{{ t('admin.beranda.emptyAktivitas') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </AppLayout>
</template>
