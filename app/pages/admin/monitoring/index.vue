<script setup lang="ts">
const { t } = useI18n()

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

const page = ref(1)
const pageSize = 10

const totalPages = computed(() => Math.max(1, Math.ceil(displayData.value.length / pageSize)))
const visibleData = computed(() => {
  const start = (page.value - 1) * pageSize
  return displayData.value.slice(start, start + pageSize)
})

const pageNumbers = computed < (number | '...')[] > (() => {
  const total = totalPages.value
  const current = page.value
  const set = new Set < number > ([1, total, current - 1, current, current + 1])
  const sorted = [...set].filter(n => n >= 1 && n <= total).sort((a, b) => a - b)
  const result: (number | '...')[] = []
  let prev = 0
  for (const n of sorted) {
    if (n - prev > 1) result.push('...')
    result.push(n)
    prev = n
  }
  return result
})

watch(() => displayData.value.length, () => {
  if (page.value > totalPages.value) page.value = totalPages.value
})

function statusLabel(status: string) {
  if (status === 'AKTIF') return t('admin.monitoring.status.AKTIF')
  if (status === 'TIDAK AKTIF') return t('admin.monitoring.status.TIDAK AKTIF')
  return status
}

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
    <PageHeader :title="t('admin.monitoring.title')" :description="t('admin.monitoring.desc')">
      <template #actions>
        <div class="flex items-center gap-3 text-xs text-gray-500">
          <div class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            {{ t('admin.monitoring.langsung') }}
          </div>
          <span class="text-[10px] px-1.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 ">{{ t('admin.monitoring.hariIni') }}</span>
        </div>
      </template>
    </PageHeader>

    <LoadingSkeleton v-if="pending" type="table" :rows="4" :columns="6" />

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <StatCard :label="t('admin.monitoring.statSesiAktif')" :value="totalAktif" variant="green" />
        <StatCard :label="t('admin.monitoring.statSudahAbsen')" :value="totalSudahAbsen" variant="blue" />
        <StatCard :label="t('admin.monitoring.statBelumAbsen')" :value="totalBelumAbsen" variant="amber" />
      </div>

      <BaseCard>
        <div class="overflow-x-auto scrollbar-thin">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-gray-50 dark:bg-slate-700/50 border-b admin-accent-border">
                <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.monitoring.colRuangan') }}</th>
                <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.monitoring.colSesiAktif') }}</th>
                <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.monitoring.colTotalMurid') }}</th>
                <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.monitoring.colSudahAbsen') }}</th>
                <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.monitoring.colBelumAbsen') }}</th>
                <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.monitoring.colStatus') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y admin-accent-divide">
              <tr v-for="item in visibleData" :key="item.ruangan" class="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <td class="px-4 py-3  text-gray-900 dark:text-gray-100">{{ item.ruangan }}</td>
                <td class="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{{ item.sesiAktif }}</td>
                <td class="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{{ item.totalSiswa }}</td>
                <td class="px-4 py-3 text-center text-green-600 dark:text-green-400 ">{{ item.sudahAbsen }}</td>
                <td class="px-4 py-3 text-center text-amber-600 dark:text-amber-400 ">{{ item.belumAbsen }}</td>
                <td class="px-4 py-3 text-center">
                  <BaseBadge :variant="item.status === 'AKTIF' ? 'green' : 'gray'" :dot="item.status === 'AKTIF'">
                    {{ statusLabel(item.status) }}
                  </BaseBadge>
                </td>
              </tr>
              <tr v-if="displayData.length === 0">
                <td colspan="6" class="px-4 py-16 text-center">
                  <p class="text-gray-500 ">{{ t('admin.monitoring.empty') }}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="displayData.length > pageSize"
          class="px-4 sm:px-6 py-3 border-t admin-accent-border flex items-center justify-between gap-3">
          <p class="text-xs text-gray-400 dark:text-gray-500">
            {{ t('common.menampilkan', { from: ((page - 1) * pageSize) + 1, to: Math.min(page * pageSize,
            displayData.length), total: displayData.length, unit: t('admin.monitoring.unitRuangan') }) }}
          </p>
          <div class="ml-auto flex items-center gap-2">
            <button @click="page--" :disabled="page <= 1"
              class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 ring-1 ring-primary-200 dark:ring-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              {{ t('common.sebelumnya') }}
            </button>
            <div class="flex items-center gap-1">
              <template v-for="(n, i) in pageNumbers" :key="i">
                <button v-if="n !== '...'" @click="page = n" :disabled="n === page"
                  :class="n === page
                    ? 'w-7 h-7 rounded-md text-xs text-white bg-primary-600 ring-1 ring-primary-600 cursor-default'
                    : 'w-7 h-7 rounded-md text-xs text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 ring-1 ring-primary-200 dark:ring-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/60 transition-colors'">
                  {{ n }}
                </button>
                <span v-else class="px-0.5 text-xs text-gray-400 dark:text-gray-500 select-none">&hellip;</span>
              </template>
            </div>
            <button @click="page++" :disabled="page >= totalPages"
              class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 ring-1 ring-primary-200 dark:ring-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
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
