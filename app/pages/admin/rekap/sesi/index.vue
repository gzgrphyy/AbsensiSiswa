<script setup lang="ts">
interface SesiItem {
  sesiId: number
  tanggal: string
  hari: string
  mapel: string
  jamMulai: string
  jamSelesai: string
  kelasId: number
  kelas: string
  ruangan: string
  statusSesi: string
  totalSiswa: number
  hadir: number
  sakit: number
  izin: number
  alpha: number
  pending: number
  persentase: number
}

const { t } = useI18n()

const page = ref(1)
const pageSize = 10

const selectedTa = ref<number | ''>('')
const selectedJenjang = ref('')
const selectedKelas = ref<number | ''>('')
const selectedDari = ref('')
const selectedSampai = ref('')
const selectedStatus = ref('')
const searchQuery = ref('')

const appliedTa = ref<number | ''>('')
const appliedJenjang = ref('')
const appliedKelas = ref<number | ''>('')
const appliedDari = ref('')
const appliedSampai = ref('')
const appliedStatus = ref('')

const { data: taList } = useFetch<{ id: number; nama: string; semester: string; isActive: boolean }[]>('/api/admin/tahun-ajaran', { immediate: true })

const semesterLabel = (s: string) => s === 'GANJIL' ? t('semester.ganjil') : t('semester.genap')

function activeTaId() {
  return taList.value?.find(t => t.isActive)?.id ?? ''
}

watch(
  taList,
  (list) => {
    if (!list?.some(t => t.isActive)) return
    if (appliedTa.value !== '') return
    selectedTa.value = activeTaId()
    appliedTa.value = activeTaId()
  },
  { immediate: true }
)

const kelasQuery = computed(() => ({
  ...(selectedTa.value ? { tahunAjaranId: selectedTa.value } : {})
}))

const { data: kelasList } = useFetch<{ id: number; nama: string }[]>('/api/admin/kelas', {
  query: kelasQuery,
  immediate: true
})

function jenjangOf(nama: string) {
  return (nama.match(/^[IVXLCDM]+/)?.[0] || '').toUpperCase()
}

const jenjangList = computed(() => {
  const set = new Set<string>()
  for (const k of kelasList.value || []) {
    const j = jenjangOf(k.nama)
    if (j) set.add(j)
  }
  return [...set].sort()
})

const filteredKelasList = computed(() => {
  if (!selectedJenjang.value) return kelasList.value || []
  return (kelasList.value || []).filter(k => jenjangOf(k.nama) === selectedJenjang.value)
})

const queryParams = computed(() => ({
  ...(appliedTa.value ? { tahunAjaranId: appliedTa.value } : {}),
  ...(appliedKelas.value ? { kelasId: appliedKelas.value } : {}),
  ...(appliedDari.value ? { tanggalMulai: appliedDari.value } : {}),
  ...(appliedSampai.value ? { tanggalAkhir: appliedSampai.value } : {}),
  ...(appliedStatus.value ? { status: appliedStatus.value } : {}),
  ...(searchQuery.value ? { search: searchQuery.value } : {})
}))

const { data, pending } = useFetch<SesiItem[]>('/api/admin/rekap/sesi', {
  query: queryParams,
  immediate: true,
  transform: (res: any) => Array.isArray(res) ? res : []
})

function applyFilter() {
  appliedTa.value = selectedTa.value
  appliedJenjang.value = selectedJenjang.value
  appliedKelas.value = selectedKelas.value
  appliedDari.value = selectedDari.value
  appliedSampai.value = selectedSampai.value
  appliedStatus.value = selectedStatus.value
  page.value = 1
}

function resetFilter() {
  const defaultTa = activeTaId()
  selectedTa.value = defaultTa
  selectedJenjang.value = ''
  selectedKelas.value = ''
  selectedDari.value = ''
  selectedSampai.value = ''
  selectedStatus.value = ''
  searchQuery.value = ''
  appliedTa.value = defaultTa
  appliedJenjang.value = ''
  appliedKelas.value = ''
  appliedDari.value = ''
  appliedSampai.value = ''
  appliedStatus.value = ''
  page.value = 1
}

watch(selectedJenjang, () => { selectedKelas.value = '' })

const displayData = computed(() => {
  let rows = Array.isArray(data.value) ? data.value : []
  if (appliedJenjang.value) {
    rows = rows.filter(d => jenjangOf(d.kelas) === appliedJenjang.value)
  }
  return rows
})

const totalPages = computed(() => Math.max(1, Math.ceil(displayData.value.length / pageSize)))

const pageNumbers = computed<(number | '...')[]>(() => {
  const total = totalPages.value
  const current = page.value
  const set = new Set<number>([1, total, current - 1, current, current + 1])
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

const visibleData = computed(() => {
  const start = (page.value - 1) * pageSize
  return displayData.value.slice(start, start + pageSize)
})

const hariLabel = (h: string) => t('hari.' + h)

function dateLabel(tanggal: string) {
  return new Date(tanggal).toLocaleDateString('id-ID')
}
</script>

<template>
  <AppLayout>
    <PageHeader :title="t('admin.rekapSesi.title')" :description="t('admin.rekapSesi.desc')" />

    <div class="flex flex-wrap items-end gap-3 mb-5">
      <div class="flex flex-col gap-1 min-w-[180px]">
        <label class="text-xs  text-gray-500">{{ t('admin.rekap.labelTa') }}</label>
        <select v-model="selectedTa"
          class="px-3 py-2 border admin-accent-border rounded-lg text-xs bg-white dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option :value="''">{{ t('admin.kelas.semuaTa') }}</option>
          <option v-for="t in taList" :key="t.id" :value="t.id">{{ t.nama }} ({{ semesterLabel(t.semester) }})</option>
        </select>
      </div>

      <div class="flex flex-col gap-1 min-w-[140px]">
        <label class="text-xs  text-gray-500">{{ t('admin.rekapSesi.labelJenjang') }}</label>
        <select v-model="selectedJenjang"
          class="px-3 py-2 border admin-accent-border rounded-lg text-xs bg-white dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">{{ t('admin.siswa.semuaJenjang') }}</option>
          <option v-for="j in jenjangList" :key="j" :value="j">{{ j }}</option>
        </select>
      </div>

      <div class="flex flex-col gap-1 min-w-[160px]">
        <label class="text-xs  text-gray-500">{{ t('admin.rekap.labelKelas') }}</label>
        <select v-model="selectedKelas"
          class="px-3 py-2 border admin-accent-border rounded-lg text-xs bg-white dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option :value="''">{{ t('admin.jadwal.semuaKelas') }}</option>
          <option v-for="k in filteredKelasList" :key="k.id" :value="k.id">{{ k.nama }}</option>
        </select>
      </div>

      <div class="flex flex-col gap-1 min-w-[150px]">
        <label class="text-xs  text-gray-500">{{ t('admin.rekapSesi.labelDari') }}</label>
        <input v-model="selectedDari" type="date"
          class="px-3 py-2 border admin-accent-border rounded-lg text-xs bg-white dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
      </div>

      <div class="flex flex-col gap-1 min-w-[150px]">
        <label class="text-xs  text-gray-500">{{ t('admin.rekapSesi.labelSampai') }}</label>
        <input v-model="selectedSampai" type="date"
          class="px-3 py-2 border admin-accent-border rounded-lg text-xs bg-white dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
      </div>

      <div class="flex flex-col gap-1 min-w-[150px]">
        <label class="text-xs  text-gray-500">{{ t('admin.rekapSesi.labelStatusSesi') }}</label>
        <select v-model="selectedStatus"
          class="px-3 py-2 border admin-accent-border rounded-lg text-xs bg-white dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">{{ t('admin.rekapSesi.semuaStatus') }}</option>
          <option value="AKTIF">{{ t('admin.rekapSesi.sesiAktif') }}</option>
          <option value="SELESAI">{{ t('admin.rekapSesi.sesiSelesai') }}</option>
        </select>
      </div>

      <div class="flex flex-col gap-1 min-w-[180px] flex-1">
        <label class="text-xs  text-gray-500">{{ t('admin.rekapSesi.searchPlaceholder') }}</label>
        <input v-model="searchQuery" type="text"
          :placeholder="t('admin.rekapSesi.searchPlaceholder')"
          class="px-3 py-2 border admin-accent-border rounded-lg text-xs bg-white dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400" />
      </div>

      <button @click="applyFilter()"
        class="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md border border-blue-600 transition-colors">
        {{ t('common.terapkan') }}
      </button>

      <button @click="resetFilter()"
        class="px-3 py-2 text-xs  text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md border admin-accent-border transition-colors">
        {{ t('common.aturUlang') }}
      </button>
    </div>

    <LoadingSkeleton v-if="pending" type="table" :rows="6" :columns="9" />

    <div v-else class="bg-white dark:bg-gray-800 rounded-lg border admin-accent-border overflow-hidden">
      <div class="overflow-x-auto scrollbar-thin">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-gray-50 dark:bg-slate-700/50 border-b admin-accent-border">
              <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.rekapSesi.colTanggal') }}</th>
              <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden sm:table-cell">{{ t('admin.rekapSesi.colHari') }}</th>
              <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden md:table-cell">{{ t('admin.rekap.colKelas') }}</th>
              <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.rekapSesi.colMapel') }}</th>
              <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden lg:table-cell">{{ t('admin.rekapSesi.colJam') }}</th>
              <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden xl:table-cell">{{ t('admin.rekapSesi.colRuangan') }}</th>
              <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.rekapSesi.colStatusSesi') }}</th>
              <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden sm:table-cell">{{ t('admin.rekapSesi.colTotalMurid') }}</th>
              <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.rekap.colHadir') }}</th>
              <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden sm:table-cell">{{ t('admin.rekap.colSakit') }}</th>
              <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden sm:table-cell">{{ t('admin.rekap.colIzin') }}</th>
              <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden sm:table-cell">{{ t('admin.rekap.colAlpha') }}</th>
              <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.rekap.colPersentase') }}</th>
              <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.rekapSesi.colDetail') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y admin-accent-divide">
            <tr v-for="item in visibleData" :key="item.sesiId" class="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
              <td class="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{{ dateLabel(item.tanggal) }}</td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">{{ hariLabel(item.hari) }}</td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-300 hidden md:table-cell">{{ item.kelas }}</td>
              <td class="px-4 py-3 text-gray-900 dark:text-gray-100">{{ item.mapel }}</td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap hidden lg:table-cell">{{ item.jamMulai }} - {{ item.jamSelesai }}</td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden xl:table-cell">{{ item.ruangan }}</td>
              <td class="px-4 py-3 text-center">
                <BaseBadge :variant="item.statusSesi === 'SELESAI' ? 'green' : 'amber'" size="sm">
                  {{ item.statusSesi === 'SELESAI' ? t('admin.rekapSesi.sesiSelesai') : t('admin.rekapSesi.sesiAktif') }}
                </BaseBadge>
              </td>
              <td class="px-4 py-3 text-center text-gray-700 dark:text-gray-300 hidden sm:table-cell">{{ item.totalSiswa }}</td>
              <td class="px-4 py-3 text-center text-green-600 dark:text-green-400">{{ item.hadir }}</td>
              <td class="px-4 py-3 text-center text-amber-600 dark:text-amber-400 hidden sm:table-cell">{{ item.sakit }}</td>
              <td class="px-4 py-3 text-center text-blue-600 dark:text-blue-400 hidden sm:table-cell">{{ item.izin }}</td>
              <td class="px-4 py-3 text-center text-red-600 dark:text-red-400 hidden sm:table-cell">{{ item.alpha }}</td>
              <td class="px-4 py-3 text-center" :class="item.persentase >= 90 ? 'text-green-600 dark:text-green-400' : item.persentase >= 75 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'">{{ item.persentase }}%</td>
              <td class="px-4 py-3 text-center">
                <NuxtLink :to="`/absensi/detail/${item.sesiId}`"
                  class="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium">
                  {{ t('admin.rekapSesi.lihatDetail') }}
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </NuxtLink>
              </td>
            </tr>
            <tr v-if="displayData.length === 0">
              <td colspan="14" class="px-4 py-16 text-center">
                <svg class="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="text-gray-500 dark:text-gray-400">{{ t('admin.rekapSesi.empty') }}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="displayData.length > pageSize" class="px-4 sm:px-6 py-3 border-t admin-accent-border flex items-center justify-between gap-3">
        <p class="text-xs text-gray-400 dark:text-gray-500">
          {{ t('common.menampilkan', { from: ((page - 1) * pageSize) + 1, to: Math.min(page * pageSize, displayData.length), total: displayData.length, unit: t('admin.rekapSesi.unitSesi') }) }}
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
          <div class="flex items-center gap-1">
            <template v-for="(n, i) in pageNumbers" :key="i">
              <button
                v-if="n !== '...'"
                @click="page = n"
                :disabled="n === page"
                :class="n === page
                  ? 'w-7 h-7 rounded-md text-xs  text-white bg-primary-600 ring-1 ring-primary-600 cursor-default'
                  : 'w-7 h-7 rounded-md text-xs  text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 ring-1 ring-primary-200 dark:ring-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/60 transition-colors'"
              >
                {{ n }}
              </button>
              <span v-else class="px-0.5 text-xs text-gray-400 dark:text-gray-500 select-none">&hellip;</span>
            </template>
          </div>
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
    </div>
  </AppLayout>
</template>