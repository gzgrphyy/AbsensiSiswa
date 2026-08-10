<script setup lang="ts">
interface AlphaItem {
  id: number
  nama: string
  kelas: string
  totalAlpha: number
}

const selectedBulan = ref('')
const selectedKelas = ref<number | ''>('')

const { data: kelasList } = useFetch<{ id: number; nama: string }[]>('/api/admin/kelas', { immediate: true })

const queryParams = computed(() => ({
  ...(selectedBulan.value ? { bulan: selectedBulan.value } : {}),
  ...(selectedKelas.value ? { kelasId: selectedKelas.value } : {}),
}))

const { data, pending, refresh } = useFetch<AlphaItem[]>('/api/admin/alpha', {
  query: queryParams,
  immediate: true,
  transform: (res: any) => Array.isArray(res) ? res : []
})

watch([selectedBulan, selectedKelas], () => refresh())

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
          class="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-none text-sm bg-white dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">Bulan Berjalan</option>
          <option v-for="o in bulanOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>

      <!-- Filter: Kelas -->
      <div class="flex flex-col gap-1 min-w-[160px]">
        <label class="text-xs text-gray-500">Kelas</label>
        <select v-model="selectedKelas"
          class="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-none text-sm bg-white dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option :value="''">Semua Kelas</option>
          <option v-for="k in kelasList" :key="k.id" :value="k.id">{{ k.nama }}</option>
        </select>
      </div>

      <!-- Tombol Reset -->
      <button @click="selectedBulan = ''; selectedKelas = ''"
        class="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-none border border-gray-300 dark:border-slate-600 transition-colors">
        Atur Ulang
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
              <tr class="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
                <th class="text-left px-4 py-3 text-gray-600 dark:text-gray-300 text-xs tracking-wider">Nama</th>
                <th class="text-left px-4 py-3 text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden sm:table-cell">Kelas</th>
                <th class="text-center px-4 py-3 text-gray-600 dark:text-gray-300 text-xs tracking-wider">Total Alpha</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
              <tr v-for="item in data" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <td class="px-4 py-3 text-gray-900 dark:text-gray-100">{{ item.nama }}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">{{ item.kelas }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-none text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 ring-1 ring-red-200 dark:ring-red-800">{{ item.totalAlpha }}x</span>
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
      </BaseCard>
    </template>
  </AppLayout>
</template>
