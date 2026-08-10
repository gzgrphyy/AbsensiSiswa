<script setup lang="ts">
import { statusLabels, statusDotColor } from '~/utils/absensi'

interface SiswaItem {
  id: number
  nisn: string
  nama: string
  request: {
    id: number
    status: string
    scannedAt: string
    keterangan: string | null
  } | null
}

interface SesiDetail {
  id: number
  status: string
  tanggal: string
  ditutupPada: string | null
  updatedAt: string
  allSiswa: SiswaItem[]
  jadwal: {
    mapel: string
    jamMulai: string
    jamSelesai: string
    kelas: { id: number; nama: string }
    ruangan: { id: number; nama: string }
    guru: { id: number; nama: string }
  }
}

const route = useRoute()
const sesiId = computed(() => parseInt(route.params.id as string))

const { data: sesi, pending, error } = useFetch<SesiDetail>(`/api/absensi/sesi/${sesiId.value}`, {
  immediate: true
})

function statusOf(s: SiswaItem): string {
  return s.request?.status || 'BELUM'
}

const statusCount = computed(() => {
  const counts: Record<string, number> = { HADIR: 0, SAKIT: 0, IZIN: 0, ALPHA: 0, PENDING: 0, BELUM: 0 }
  for (const s of sesi.value?.allSiswa || []) {
    counts[statusOf(s)] = (counts[statusOf(s)] || 0) + 1
  }
  return counts
})

const hasAnyStatus = computed(() => Object.values(statusCount.value).some(c => c > 0))
</script>

<template>
  <PTKLayout>
    <PageHeader title="Detail Absensi" description="Perincian kehadiran murid per sesi" back-to="/absensi/rekap" />

    <LoadingSkeleton v-if="pending" type="table" :rows="5" :columns="5" />

    <div
      v-else-if="error"
      class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-card dark:shadow-dark-card px-6 py-16 text-center"
    >
      <p class="text-gray-500 dark:text-gray-400 font-medium">Gagal memuat detail sesi</p>
    </div>

    <template v-else-if="sesi">
      <!-- Session Info Bar -->
      <div class="rounded-2xl border p-5 shadow-card dark:shadow-dark-card mb-4 bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2.5 rounded-full flex-shrink-0 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Sesi absensi</p>
            <p class="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{{ sesi.jadwal.mapel }}</p>
          </div>
          <BaseBadge :variant="sesi.status === 'AKTIF' ? 'green' : 'gray'">{{ sesi.status }}</BaseBadge>
        </div>

        <dl class="space-y-1.5 text-sm">
          <div class="flex items-center justify-between gap-3">
            <dt class="text-gray-500 dark:text-gray-400">Kelas</dt>
            <dd class="font-semibold text-gray-900 dark:text-gray-100">{{ sesi.jadwal.kelas.nama }}</dd>
          </div>
          <div class="flex items-center justify-between gap-3">
            <dt class="text-gray-500 dark:text-gray-400">Ruangan</dt>
            <dd class="font-semibold text-gray-900 dark:text-gray-100">{{ sesi.jadwal.ruangan.nama }}</dd>
          </div>
          <div class="flex items-center justify-between gap-3">
            <dt class="text-gray-500 dark:text-gray-400">Waktu</dt>
            <dd class="font-semibold text-gray-900 dark:text-gray-100">{{ sesi.jadwal.jamMulai }} - {{ sesi.jadwal.jamSelesai }}</dd>
          </div>
          <div class="flex items-center justify-between gap-3">
            <dt class="text-gray-500 dark:text-gray-400">Tanggal</dt>
            <dd class="font-semibold text-gray-900 dark:text-gray-100">{{ new Date(sesi.tanggal).toLocaleDateString('id-ID') }}</dd>
          </div>
          <div class="flex items-center justify-between gap-3">
            <dt class="text-gray-500 dark:text-gray-400">Guru</dt>
            <dd class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ sesi.jadwal.guru.nama }}</dd>
          </div>
        </dl>
      </div>

      <!-- Status Summary -->
      <div v-if="hasAnyStatus" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
        <div v-if="statusCount.HADIR" class="rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3 flex items-center justify-center gap-2">
          <span class="w-2 h-2 rounded-full bg-green-500" />
          <b class="text-sm font-bold text-green-600 dark:text-green-400">{{ statusCount.HADIR }}</b>
          <span class="text-xs text-gray-500 dark:text-gray-400">Hadir</span>
        </div>
        <div v-if="statusCount.SAKIT" class="rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3 flex items-center justify-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-500" />
          <b class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ statusCount.SAKIT }}</b>
          <span class="text-xs text-gray-500 dark:text-gray-400">Sakit</span>
        </div>
        <div v-if="statusCount.IZIN" class="rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3 flex items-center justify-center gap-2">
          <span class="w-2 h-2 rounded-full bg-blue-500" />
          <b class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ statusCount.IZIN }}</b>
          <span class="text-xs text-gray-500 dark:text-gray-400">Izin</span>
        </div>
        <div v-if="statusCount.ALPHA" class="rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3 flex items-center justify-center gap-2">
          <span class="w-2 h-2 rounded-full bg-red-500" />
          <b class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ statusCount.ALPHA }}</b>
          <span class="text-xs text-gray-500 dark:text-gray-400">Alpha</span>
        </div>
        <div v-if="statusCount.PENDING" class="rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3 flex items-center justify-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-400" />
          <b class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ statusCount.PENDING }}</b>
          <span class="text-xs text-gray-500 dark:text-gray-400">Menunggu</span>
        </div>
        <div v-if="statusCount.BELUM" class="rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3 flex items-center justify-center gap-2">
          <span class="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
          <b class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ statusCount.BELUM }}</b>
          <span class="text-xs text-gray-500 dark:text-gray-400">Belum Absen</span>
        </div>
      </div>

      <!-- Siswa Table -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-card dark:shadow-dark-card overflow-hidden">
        <div class="overflow-x-auto scrollbar-thin">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
                <th class="text-left px-3 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Nama</th>
                <th class="text-left px-3 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider hidden sm:table-cell">NISN</th>
                <th class="text-center px-3 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Status</th>
                <th class="text-center px-3 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider hidden md:table-cell">Keterangan</th>
                <th class="text-center px-3 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider hidden md:table-cell">Scan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
              <tr v-for="s in sesi.allSiswa" :key="s.id" class="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <td class="px-3 py-3">
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ s.nama }}</span>
                </td>
                <td class="px-3 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{{ s.nisn }}</td>
                <td class="px-3 py-3 text-center">
                  <span
                    v-if="statusOf(s) === 'HADIR'"
                    class="inline-flex items-center rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 ring-1 ring-green-200 dark:ring-green-800 px-2.5 py-1 text-xs font-medium"
                  >
                    Hadir
                  </span>
                  <span
                    v-else-if="statusOf(s) === 'BELUM'"
                    class="inline-flex items-center rounded-full border border-dashed border-gray-300 dark:border-slate-600 text-gray-400 dark:text-gray-500 px-2.5 py-1 text-xs font-medium"
                  >
                    Belum Absen
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1.5 rounded-full bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-slate-600 px-2.5 py-1 text-xs font-medium"
                  >
                    <span :class="['w-2 h-2 rounded-full', statusDotColor[statusOf(s)] || 'bg-gray-400']" />
                    {{ statusLabels[statusOf(s)] || statusOf(s) }}
                  </span>
                </td>
                <td class="px-3 py-3 text-center hidden md:table-cell">
                  <span class="text-xs text-gray-400 dark:text-gray-500">{{ s.request?.keterangan || '-' }}</span>
                </td>
                <td class="px-3 py-3 text-center hidden md:table-cell">
                  <span v-if="s.request" class="text-xs text-gray-400 dark:text-gray-500">
                    {{ new Date(s.request.scannedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
                  </span>
                  <span v-else class="text-xs text-gray-300 dark:text-slate-500">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </PTKLayout>
</template>