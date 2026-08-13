<script setup lang="ts">
interface AlphaItem {
  id: number
  nama: string
  kelas: string
  totalAlpha: number
}

const { t } = useI18n()

const selectedBulan = ref('')
const selectedKelas = ref<number | ''>('')

const appliedBulan = ref('')
const appliedKelas = ref<number | ''>('')

const { data: kelasList } = useFetch<{ id: number; nama: string }[]>('/api/admin/kelas', { immediate: true })

const queryParams = computed(() => ({
  ...(appliedBulan.value ? { bulan: appliedBulan.value } : {}),
  ...(appliedKelas.value ? { kelasId: appliedKelas.value } : {}),
}))

const { data, pending, refresh } = useFetch<AlphaItem[]>('/api/admin/alpha', {
  query: queryParams,
  immediate: true,
  transform: (res: any) => Array.isArray(res) ? res : []
})

const page = ref(1)
const pageSize = 10

watch([appliedBulan, appliedKelas], () => { page.value = 1 })

function applyFilter() {
  appliedBulan.value = selectedBulan.value
  appliedKelas.value = selectedKelas.value
}

function resetFilter() {
  selectedBulan.value = ''
  selectedKelas.value = ''
  appliedBulan.value = ''
  appliedKelas.value = ''
}

const totalPages = computed(() => Math.max(1, Math.ceil((data.value || []).length / pageSize)))
const visibleData = computed(() => {
  const start = (page.value - 1) * pageSize
  return (data.value || []).slice(start, start + pageSize)
})

const bulanOptions = computed(() => {
  const options = []
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
    options.push({ value, label })
  }
  return options
})

const totalAlpha = computed(() => (data.value || []).reduce((a, b) => a + b.totalAlpha, 0))
</script>

<template>
  <AppLayout>
    <PageHeader title="Detail Alpha Murid" description="Rekapitulasi murid dengan alpha terbanyak" back-to="/admin" />

    <div class="flex flex-wrap items-end gap-3 mb-5">
      <!-- Filter: Periode Bulan -->
      <div class="flex flex-col gap-1 min-w-[180px]">
        <label class="text-xs text-gray-500">Periode</label>
        <select v-model="selectedBulan"
          class="px-3 py-2 border admin-accent-border rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">Bulan Berjalan</option>
          <option v-for="o in bulanOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>

      <!-- Filter: Kelas -->
      <div class="flex flex-col gap-1 min-w-[160px]">
        <label class="text-xs text-gray-500">Kelas</label>
        <select v-model="selectedKelas"
          class="px-3 py-2 border admin-accent-border rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option :value="''">Semua Kelas</option>
          <option v-for="k in kelasList" :key="k.id" :value="k.id">{{ k.nama }}</option>
        </select>
      </div>

      <!-- Tombol Terapkan -->
      <button @click="applyFilter()"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md border border-blue-600 transition-colors">
        {{ t('common.terapkan') }}
      </button>

      <!-- Tombol Reset -->
      <button @click="resetFilter()"
        class="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md border admin-accent-border transition-colors">
        {{ t('common.aturUlang') }}
      </button>
    </div>

    <LoadingSkeleton v-if="pending" type="table" :rows="6" :columns="3" />

    <template v-else>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <StatCard label="Total Alpha" :value="totalAlpha" variant="red" />
        <StatCard label="Murid" :value="(data || []).length" variant="gray" />
      </div>

      <BaseCard>
        <div class="overflow-x-auto scrollbar-thin">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-slate-700/50 border-b admin-accent-border">
                <th class="text-left px-4 py-3 text-gray-600 dark:text-gray-300 text-xs tracking-wider">Nama</th>
                <th class="text-left px-4 py-3 text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden sm:table-cell">Kelas</th>
                <th class="text-center px-4 py-3 text-gray-600 dark:text-gray-300 text-xs tracking-wider">Total Alpha</th>
              </tr>
            </thead>
            <tbody class="divide-y admin-accent-divide">
              <tr v-for="item in visibleData" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <td class="px-4 py-3 text-gray-900 dark:text-gray-100">{{ item.nama }}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">{{ item.kelas }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 ring-1 ring-red-200 dark:ring-red-800">{{ item.totalAlpha }}x</span>
                </td>
              </tr>
              <tr v-if="!data || data.length === 0">
                <td colspan="3" class="px-4 py-16 text-center">
                  <svg class="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p class="text-gray-500 dark:text-gray-400">Tidak ada data alpha pada periode ini</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="(data || []).length > pageSize" class="px-4 sm:px-6 py-3 border-t admin-accent-border flex items-center justify-between gap-3">
          <p class="text-xs text-gray-400 dark:text-gray-500">
            {{ t('common.menampilkan', { from: ((page - 1) * pageSize) + 1, to: Math.min(page * pageSize, (data || []).length), total: (data || []).length, unit: t('admin.siswa.unitMurid') }) }}
          </p>
          <div class="ml-auto flex items-center gap-2">
            <button
              @click="page--"
              :disabled="page <= 1"
              class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs  text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 ring-1 ring-primary-200 dark:ring-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              {{ t('common.sebelumnya') }}
            </button>
            <span class="text-xs text-gray-400 dark:text-gray-500">{{ t('common.halaman', { page, total: totalPages }) }}</span>
            <button
              @click="page++"
              :disabled="page >= totalPages"
              class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs  text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 ring-1 ring-primary-200 dark:ring-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {{ t('common.selanjutnya') }}
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </BaseCard>
    </template>
  </AppLayout>
</template>
