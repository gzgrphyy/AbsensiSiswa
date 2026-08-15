<script setup lang="ts">
interface RekapItem {
  id: number
  tanggal: string
  mapel: string
  kelas: string
  ruangan: string
  totalSiswa: number
  hadir: number
  sakit: number
  izin: number
  alpha: number
  persentase: number
}

interface MingguanJadwal {
  id: number
  hari: string
  mapel: string
  jamMulai: string
  jamSelesai: string
  kelas: { id: number; nama: string }
  ruangan: { id: number; nama: string }
}

const { data, pending } = useFetch<RekapItem[]>('/api/absensi/rekap', {
  immediate: true,
  transform: (res: any) => res || []
})

const { data: jadwalMingguan, pending: pendingMingguan } = useFetch<{ hariOrder: string[]; grouped: Record<string, MingguanJadwal[]> }>('/api/absensi/jadwal-mingguan', {
  immediate: true
})

const route = useRoute()

watch([pending, pendingMingguan], ([p1, p2]) => {
  if (!p1 && !p2 && route.hash === '#jadwal-minggu') {
    nextTick(() => {
      document.getElementById('jadwal-minggu')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
})

const displayData = computed(() => data.value || [])

const hariLabels: Record<string, string> = {
  SENIN: 'Senin', SELASA: 'Selasa', RABU: 'Rabu', KAMIS: 'Kamis', JUMAT: 'Jumat', SABTU: 'Sabtu', MINGGU: 'Minggu'
}
const dayNames = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU']
const todayName = dayNames[new Date().getDay()]

function dateOfHari(h: string): Date {
  const now = new Date()
  const dow = now.getDay()
  const diffToMonday = (dow === 0 ? 7 : dow) - 1
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(now.getDate() - diffToMonday)
  const idx = dayNames.indexOf(h)
  const offset = idx === 0 ? 6 : idx - 1
  const d = new Date(monday)
  d.setDate(monday.getDate() + offset)
  return d
}

function hariDateLabel(h: string): string {
  return dateOfHari(h).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })
}
const hariOrder = computed(() => jadwalMingguan.value?.hariOrder || [])
const hasWeeklyJadwal = computed(() =>
  Object.values(jadwalMingguan.value?.grouped || {}).some(arr => arr.length > 0)
)
const groupedJadwal = computed(() => jadwalMingguan.value?.grouped || {})

const totalHadir = computed(() => displayData.value.reduce((a, b) => a + b.hadir, 0))
const totalSiswa = computed(() => displayData.value.reduce((a, b) => a + b.totalSiswa, 0))
const rataPersentase = computed(() =>
  displayData.value.length ? (displayData.value.reduce((a, b) => a + b.persentase, 0) / displayData.value.length).toFixed(1) : '0'
)
</script>

<template>
  <PTKLayout>
    <PageHeader title="Rekap Absensi" description="Rekapitulasi kehadiran berdasarkan jadwal" :show-back="false">
      <template #actions>
        <NuxtLink
          to="/absensi/export"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary-500 rounded-xl hover:bg-primary-600 active:bg-primary-700 transition-colors shadow-md shadow-primary-500/30"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export
        </NuxtLink>
      </template>
    </PageHeader>

    <LoadingSkeleton v-if="pending" type="table" :rows="4" :columns="5" />

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <StatCard label="Total Sesi" :value="displayData.length" variant="blue" />
        <StatCard label="Total Hadir" :value="totalHadir" variant="green" />
        <StatCard label="Rata-rata %" :value="rataPersentase + '%'" variant="green" />
      </div>

      <BaseCard>
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
              <th class="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs tracking-wider">Tanggal</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs tracking-wider">Mata Pelajaran</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs tracking-wider">Kelas</th>
              <th class="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs tracking-wider">Persentase</th>
              <th class="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs tracking-wider">Detail</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
            <tr v-for="item in displayData" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{{ new Date(item.tanggal).toLocaleDateString('id-ID') }}</td>
              <td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 truncate max-w-[10rem]">{{ item.mapel }}</td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-300 truncate max-w-[6rem]">{{ item.kelas }}</td>
              <td class="px-4 py-3 text-center font-semibold" :class="item.persentase >= 90 ? 'text-green-600' : item.persentase >= 75 ? 'text-amber-600' : 'text-red-600'">{{ item.persentase }}%</td>
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
                <p class="text-gray-500 dark:text-gray-400 font-medium">Belum ada data rekap</p>
              </td>
            </tr>
          </tbody>
        </table>
      </BaseCard>

      <BaseCard id="jadwal-minggu" class="mt-5 scroll-mt-24">
        <div class="flex items-end justify-between mb-4">
          <h2 class="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight">Jadwal Minggu Ini</h2>
        </div>

        <div v-if="!hasWeeklyJadwal" class="py-8 px-6 text-center">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Belum ada jadwal untuk minggu ini.</p>
        </div>

        <div v-else class="space-y-4">
          <template v-for="h in hariOrder" :key="h">
            <div
              v-if="groupedJadwal[h] && groupedJadwal[h].length > 0"
              class="rounded-xl border overflow-hidden shadow-card dark:shadow-dark-card transition-shadow"
              :class="h === todayName
                ? 'border-primary-200 dark:border-primary-800 ring-2 ring-primary-500/30'
                : 'border-gray-100 dark:border-slate-700'"
            >
              <div
                class="flex items-center justify-between px-5 py-3.5 border-b"
                :class="h === todayName
                  ? 'border-primary-100 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800'"
              >
                <div class="flex items-center gap-3">
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ hariLabels[h] }}</h3>
                      <span
                        v-if="h === todayName"
                        class="text-[10px] font-semibold text-primary-600 dark:text-primary-400 bg-white dark:bg-primary-900/40 ring-1 ring-primary-200 dark:ring-primary-800 px-1.5 py-0.5 rounded-full"
                      >
                        Hari ini
                      </span>
                    </div>
                    <p class="text-xs text-gray-400 dark:text-gray-500">{{ hariDateLabel(h) }}</p>
                  </div>
                </div>
                <BaseBadge variant="gray" size="sm">{{ groupedJadwal[h].length }} mapel</BaseBadge>
              </div>

              <div class="divide-y divide-gray-100 dark:divide-slate-700">
                <div
                  v-for="ij in groupedJadwal[h]"
                  :key="ij.id"
                  class="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div class="text-center flex-shrink-0 w-16">
                    <p class="text-xs font-bold text-gray-900 dark:text-gray-100 leading-none">{{ ij.jamMulai }}</p>
                    <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1 leading-none">&ndash; {{ ij.jamSelesai }}</p>
                  </div>
                  <div class="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600 flex-shrink-0"></div>
                  <div class="min-w-0 flex-1">
                    <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{{ ij.mapel }}</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ ij.kelas.nama }} · {{ ij.ruangan.nama }}</p>
                  </div>
                  <div class="flex-shrink-0 hidden sm:block">
                    <BaseBadge variant="blue" size="sm">{{ ij.kelas.nama }}</BaseBadge>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </BaseCard>
    </template>
  </PTKLayout>
</template>
