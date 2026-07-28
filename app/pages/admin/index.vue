<script setup lang="ts">
// Mock data untuk dashboard admin
const mockData = {
  stats: {
    totalGuru: 24,
    totalSiswa: 486,
    totalKelas: 12,
    tahunAjaran: '2026/2027 Ganjil',
    hadir: 412,
    sakit: 23,
    izin: 31,
    alpha: 20,
    persentase: '84.8%',
    totalRuangan: 8,
    ruanganAktif: 6,
  },
  topAlpha: [
    { nama: 'Budi Santoso', kelas: 'XII-A', total: 5 },
    { nama: 'Siti Rahmawati', kelas: 'XI-B', total: 4 },
    { nama: 'Ahmad Fauzi', kelas: 'X-C', total: 3 },
    { nama: 'Dewi Lestari', kelas: 'XII-A', total: 3 },
    { nama: 'Rudi Hermawan', kelas: 'X-A', total: 2 },
  ],
  monitoring: [
    { ruangan: 'Lab Komputer', status: 'Aktif', sesi: 'Pemrograman Dasar', guru: 'Pak Budi' },
    { ruangan: 'Kelas XII-A', status: 'Aktif', sesi: 'Matematika', guru: 'Bu Siti' },
    { ruangan: 'Kelas XI-B', status: 'Aktif', sesi: 'Bahasa Inggris', guru: 'Pak Joko' },
    { ruangan: 'Kelas X-A', status: 'Aktif', sesi: 'Fisika', guru: 'Bu Dewi' },
    { ruangan: 'Perpustakaan', status: 'Istirahat', sesi: '-', guru: '-' },
    { ruangan: 'Lab Bahasa', status: 'Kosong', sesi: '-', guru: '-' },
  ],
  aktivitas: [
    { waktu: '10:32', aksi: 'Sesi ditutup', detail: 'Matematika - XII-A oleh Bu Siti' },
    { waktu: '10:15', aksi: 'Sesi dibuka', detail: 'Fisika - X-A oleh Bu Dewi' },
    { waktu: '09:50', aksi: 'Konfirmasi massal', detail: 'Bahasa Inggris - XI-B (32 siswa)' },
    { waktu: '09:30', aksi: 'Pindai QR', detail: 'Budi Santoso - Lab Komputer' },
    { waktu: '09:15', aksi: 'Sesi ditutup', detail: 'Bahasa Indonesia - X-C oleh Pak Ahmad' },
    { waktu: '08:45', aksi: 'Sesi dibuka', detail: 'Pemrograman Dasar - Lab Komputer oleh Pak Budi' },
  ]
}
</script>

<template>
  <AppLayout>
    <!-- Page Header -->
    <PageHeader title="Dasbor Admin" description="Ikhtisar sistem absensi sekolah" :show-back="false" />

    <!-- Context Banner: Tahun Ajaran -->
      <div class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm px-4 py-3 mb-5 flex items-center gap-3">
      <div class="w-8 h-8 rounded-sm bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
        <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-sm font-semibold text-blue-800 dark:text-blue-300">Tahun Ajaran {{ mockData.stats.tahunAjaran }}</span>
        <span class="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
        <span class="text-xs font-medium text-blue-600 dark:text-blue-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">Semester Ganjil</span>
        <span class="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
        <span class="text-xs text-blue-500 dark:text-blue-400">Aktif</span>
      </div>
    </div>

    <!-- Row 1: Master Data — Grid 12 kolom, 4 card × col-span-3 -->
    <div class="grid grid-cols-12 gap-4 mb-5">
      <!-- Guru -->
      <div class="col-span-12 sm:col-span-6 lg:col-span-3">
        <StatCard label="Jumlah Guru" :value="mockData.stats.totalGuru" variant="purple">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </template>
        </StatCard>
      </div>

      <!-- Siswa -->
      <div class="col-span-12 sm:col-span-6 lg:col-span-3">
        <StatCard label="Jumlah Siswa" :value="mockData.stats.totalSiswa" variant="green">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5zm0-7l-9-5 9-5 9 5-9 5z" />
            </svg>
          </template>
        </StatCard>
      </div>

      <!-- Kelas -->
      <div class="col-span-12 sm:col-span-6 lg:col-span-3">
        <StatCard label="Jumlah Kelas" :value="mockData.stats.totalKelas" variant="purple">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </template>
        </StatCard>
      </div>

      <!-- Total Ruangan -->
      <div class="col-span-12 sm:col-span-6 lg:col-span-3">
        <StatCard label="Total Ruangan" :value="mockData.stats.totalRuangan" variant="amber">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </template>
        </StatCard>
      </div>
    </div>

    <!-- Row 2: Data Kehadiran Hari Ini — Grid 12 kolom, 6 card × col-span-2 -->
    <div class="grid grid-cols-12 gap-4 mb-5">
      <!-- Hadir -->
      <div class="col-span-6 sm:col-span-4 lg:col-span-2">
        <StatCard label="Hadir" :value="mockData.stats.hadir" variant="green">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </template>
        </StatCard>
      </div>

      <!-- Sakit -->
      <div class="col-span-6 sm:col-span-4 lg:col-span-2">
        <StatCard label="Sakit" :value="mockData.stats.sakit" variant="red">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </template>
        </StatCard>
      </div>

      <!-- Izin -->
      <div class="col-span-6 sm:col-span-4 lg:col-span-2">
        <StatCard label="Izin" :value="mockData.stats.izin" variant="purple">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </template>
        </StatCard>
      </div>

      <!-- Alpha -->
      <div class="col-span-6 sm:col-span-4 lg:col-span-2">
        <StatCard label="Alpha" :value="mockData.stats.alpha" variant="gray">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </template>
        </StatCard>
      </div>

      <!-- Persentase Kehadiran — Aksen -->
      <div class="col-span-6 sm:col-span-4 lg:col-span-2">
        <StatCard label="Persentase" :value="mockData.stats.persentase" variant="primary" trend="up" trend-label="Hari Ini">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </template>
        </StatCard>
      </div>

      <!-- Ruangan Aktif — Aksen -->
      <div class="col-span-6 sm:col-span-4 lg:col-span-2">
        <StatCard label="Ruangan Aktif" :value="mockData.stats.ruanganAktif" variant="primary" trend="neutral" :trend-label="`dari ${mockData.stats.totalRuangan} ruangan`">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </template>
        </StatCard>
      </div>
    </div>

    <!-- Tables Section — sejajar dengan lebar card di atas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
      <!-- Top Alpha Siswa -->
      <div class="bg-white dark:bg-gray-800 rounded-sm border border-gray-300 dark:border-gray-600">
        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Siswa Alpha Terbanyak</h3>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Periode bulan ini</p>
          </div>
          <span class="text-xs text-gray-400 dark:text-gray-500 font-medium bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-sm">{{ mockData.topAlpha.length }} siswa</span>
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
              <tr v-for="(item, idx) in mockData.topAlpha" :key="idx" class="hover:bg-gray-50/40 dark:hover:bg-gray-700/30 transition-colors">
                <td class="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">{{ item.nama }}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400 text-center">{{ item.kelas }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800">{{ item.total }}x</span>
                </td>
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
          <BaseBadge variant="green" dot size="sm">{{ mockData.monitoring.filter(r => r.status === 'Aktif').length }} Aktif</BaseBadge>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-slate-700/50">
                <th class="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Ruangan</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Status</th>
                <th class="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Sesi</th>
                <th class="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider hidden md:table-cell">Guru</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="(item, idx) in mockData.monitoring" :key="idx" class="hover:bg-gray-50/40 dark:hover:bg-gray-700/30 transition-colors">
                <td class="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">{{ item.ruangan }}</td>
                <td class="px-4 py-3 text-center">
                  <BaseBadge
                    :variant="item.status === 'Aktif' ? 'green' : item.status === 'Istirahat' ? 'amber' : 'gray'"
                    :dot="item.status === 'Aktif'"
                    :pulse="item.status === 'Aktif'"
                  >
                    {{ item.status }}
                  </BaseBadge>
                </td>
                <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ item.sesi }}</td>
                <td class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell">{{ item.guru }}</td>
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
            <tr v-for="(item, idx) in mockData.aktivitas" :key="idx" class="hover:bg-gray-50/40 dark:hover:bg-gray-700/30 transition-colors">
              <td class="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs font-mono">{{ item.waktu }}</td>
              <td class="px-4 py-3">
                <BaseBadge
                  :variant="item.aksi.includes('dibuka') ? 'green' : item.aksi.includes('ditutup') ? 'gray' : 'primary'"
                  size="sm"
                >
                  {{ item.aksi }}
                </BaseBadge>
              </td>
              <td class="px-5 py-3 text-gray-700 dark:text-gray-300">{{ item.detail }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>
