<script setup lang="ts">
interface SiswaItem {
  id: number
  nisn: string
  nama: string
  nomorHp1: string | null
  nomorHp2: string | null
  namaWali: string | null
  kontakWali: string | null
  user: { id: number; nama: string; email: string; isActive: boolean } | null
}

interface KelasDetail {
  id: number
  nama: string
  waliKelasId: number | null
  tahunAjaranId: number
  waliKelas: { id: number; nama: string; nip: string | null } | null
  tahunAjaran: { id: number; nama: string; semester: string }
  _count: { siswa: number; jadwalPelajaran: number }
  siswa: SiswaItem[]
}

const { t } = useI18n()

const route = useRoute()
const kelasId = computed(() => parseInt(route.params.id as string))

const { data: kelas, pending, error } = useFetch<KelasDetail>(`/api/admin/kelas/${kelasId.value}`, {
  immediate: true
})

const semesterLabel = (s: string) => s === 'GANJIL' ? t('semester.ganjil') : t('semester.genap')
const totalSiswa = computed(() => kelas.value?.siswa.length || 0)
const totalJadwal = computed(() => kelas.value?._count.jadwalPelajaran || 0)
</script>

<template>
  <AppLayout>
    <PageHeader :title="t('admin.kelas.detailTitle')" :description="kelas?.nama" back-to="/admin/kelas" />

    <LoadingSkeleton v-if="pending" type="table" :rows="5" :columns="5" />

    <div
      v-else-if="error"
      class="bg-white dark:bg-gray-800 rounded-lg border admin-accent-border px-6 py-16 text-center"
    >
      <svg class="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <p class="text-gray-500 dark:text-gray-400 font-medium">{{ t('admin.kelas.msgGagalDetail') }}</p>
    </div>

    <template v-else-if="kelas">
      <!-- Info Bar -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border admin-accent-border p-5 mb-4">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex-shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ t('admin.kelas.labelNama') }}</p>
            <p class="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{{ kelas.nama }}</p>
          </div>
        </div>

        <dl class="space-y-1.5 text-sm">
          <div class="flex items-center justify-between gap-3">
            <dt class="text-gray-500 dark:text-gray-400">{{ t('admin.kelas.colWali') }}</dt>
            <dd class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ kelas.waliKelas?.nama || '-' }}</dd>
          </div>
          <div class="flex items-center justify-between gap-3">
            <dt class="text-gray-500 dark:text-gray-400">{{ t('admin.kelas.colTa') }}</dt>
            <dd class="font-semibold text-gray-900 dark:text-gray-100">{{ kelas.tahunAjaran.nama }} ({{ semesterLabel(kelas.tahunAjaran.semester) }})</dd>
          </div>
          <div class="flex items-center justify-between gap-3">
            <dt class="text-gray-500 dark:text-gray-400">{{ t('admin.kelas.colMurid') }}</dt>
            <dd class="font-semibold text-gray-900 dark:text-gray-100">{{ totalSiswa }} {{ t('admin.siswa.unitMurid') }}</dd>
          </div>
          <div class="flex items-center justify-between gap-3">
            <dt class="text-gray-500 dark:text-gray-400">{{ t('admin.kelas.colJadwal') }}</dt>
            <dd class="font-semibold text-gray-900 dark:text-gray-100">{{ totalJadwal }}</dd>
          </div>
        </dl>
      </div>

      <!-- Siswa Table -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border admin-accent-border overflow-hidden">
        <div class="px-4 sm:px-6 py-3 border-b admin-accent-border flex items-center justify-between gap-3">
          <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ t('admin.kelas.daftarMurid') }}</h2>
          <span class="text-xs text-gray-400 dark:text-gray-500">{{ totalSiswa }} {{ t('admin.siswa.unitMurid') }}</span>
        </div>
        <div class="overflow-x-auto scrollbar-thin">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-slate-700/50 border-b admin-accent-border">
                <th class="text-left px-4 py-3 text-gray-600 dark:text-gray-300 text-xs tracking-wider w-12">No</th>
                <th class="text-left px-4 py-3 text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.guru.colNama') }}</th>
                <th class="text-left px-4 py-3 text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden sm:table-cell">{{ t('admin.siswa.colNisn') }}</th>
                <th class="text-left px-4 py-3 text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden md:table-cell">{{ t('admin.guru.colNoHp') }}</th>
                <th class="text-left px-4 py-3 text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden lg:table-cell">{{ t('admin.siswa.labelNamaWali') }}</th>
                <th class="text-center px-4 py-3 text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden xl:table-cell">{{ t('admin.tahunAjaran.colStatus') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y admin-accent-divide">
              <tr v-for="(s, idx) in kelas.siswa" :key="s.id" class="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <td class="px-4 py-3 text-gray-400 dark:text-gray-500">{{ idx + 1 }}</td>
                <td class="px-4 py-3">
                  <span class="text-gray-900 dark:text-gray-100">{{ s.nama }}</span>
                  <div class="text-xs text-gray-400 dark:text-gray-500 sm:hidden">{{ s.nisn }}</div>
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">{{ s.nisn }}</td>
                <td class="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs hidden md:table-cell">{{ s.nomorHp1 || s.nomorHp2 || '-' }}</td>
                <td class="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs hidden lg:table-cell">{{ s.namaWali || '-' }}</td>
                <td class="px-4 py-3 text-center hidden xl:table-cell">
                  <BaseBadge :variant="s.user?.isActive ? 'green' : 'gray'" size="sm" :dot="s.user?.isActive" :pulse="s.user?.isActive">
                    {{ s.user?.isActive ? t('admin.tahunAjaran.aktif') : t('admin.tahunAjaran.tidakAktif') }}
                  </BaseBadge>
                </td>
              </tr>
              <tr v-if="kelas.siswa.length === 0">
                <td colspan="6" class="px-4 py-16 text-center">
                  <svg class="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p class="text-gray-500 dark:text-gray-400">{{ t('admin.kelas.emptyMurid') }}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </AppLayout>
</template>
