<script setup lang="ts">
interface Jadwal {
  id: number
  mapel: string
  hari: string
  jamMulai: string
  jamSelesai: string
  kelas: { id: number; nama: string }
  ruangan: { id: number; nama: string }
  guru: { id: number; nama: string }
}

const { t } = useI18n()

const { data: kelasList } = useFetch<{ id: number; nama: string }[]>('/api/admin/kelas', { immediate: true })
const { data: guruList } = useFetch<{ id: number; nama: string }[]>('/api/admin/guru', { immediate: true })
const { data: ruanganList } = useFetch<{ id: number; nama: string }[]>('/api/admin/ruangan', { immediate: true })

const hariList = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU']
const hariLabel = (h: string) => t('hari.' + h)

const route = useRoute()

const filterKelasId = ref<number | undefined>(route.query.kelasId ? Number(route.query.kelasId) : undefined)
const filterHari = ref<string | undefined>(route.query.hari ? String(route.query.hari) : undefined)
const filterGuruId = ref<number | undefined>(route.query.guruId ? Number(route.query.guruId) : undefined)

const queryParams = computed(() => {
  const params: Record<string, any> = {}
  if (filterKelasId.value) params.kelasId = filterKelasId.value
  if (filterHari.value) params.hari = filterHari.value
  if (filterGuruId.value) params.guruId = filterGuruId.value
  return params
})

const { data: jadwalList, pending, refresh } = useFetch<Jadwal[]>('/api/admin/jadwal-pelajaran', {
  query: queryParams,
  immediate: true,
  watch: [queryParams]
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filterKelasId.value) count++
  if (filterHari.value) count++
  if (filterGuruId.value) count++
  return count
})

function applyFilter() {
  navigateTo({ query: queryParams.value })
}

function resetFilter() {
  filterKelasId.value = undefined
  filterHari.value = undefined
  filterGuruId.value = undefined
  navigateTo({ query: {} })
}

const showModal = ref(false)
const editing = ref<Jadwal | null>(null)
const form = ref({ mapel: '', hari: 'SENIN', jamMulai: '', jamSelesai: '', kelasId: 0, ruanganId: 0, guruId: 0 })
const saving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const confirmDelete = ref<{ id: number; mapel: string } | null>(null)
const confirmClose = ref(false)
const dirtyForm = ref(false)

function showError(msg: string) {
  errorMsg.value = msg
  setTimeout(() => { errorMsg.value = '' }, 5000)
}

function showSuccess(msg: string) {
  successMsg.value = msg
  setTimeout(() => { successMsg.value = '' }, 3000)
}

function openCreate() {
  editing.value = null
  form.value = { mapel: '', hari: 'SENIN', jamMulai: '', jamSelesai: '', kelasId: 0, ruanganId: 0, guruId: 0 }
  errorMsg.value = ''
  dirtyForm.value = false
  showModal.value = true
}

function openEdit(item: Jadwal) {
  editing.value = item
  form.value = {
    mapel: item.mapel,
    hari: item.hari,
    jamMulai: item.jamMulai,
    jamSelesai: item.jamSelesai,
    kelasId: item.kelas.id,
    ruanganId: item.ruangan.id,
    guruId: item.guru.id
  }
  errorMsg.value = ''
  dirtyForm.value = false
  showModal.value = true
}

function onFormChange() { dirtyForm.value = true }

function handleCloseClick() {
  showModal.value = false
}

async function handleSave() {
  saving.value = true
  errorMsg.value = ''

  try {
    const body = {
      mapel: form.value.mapel,
      hari: form.value.hari,
      jamMulai: form.value.jamMulai,
      jamSelesai: form.value.jamSelesai,
      kelasId: form.value.kelasId,
      ruanganId: form.value.ruanganId,
      guruId: form.value.guruId
    }

    if (editing.value) {
      const { error } = await useFetch(`/api/admin/jadwal-pelajaran/${editing.value.id}`, { method: 'PATCH', body })
      if (error.value) { showError(error.value.statusMessage || 'Gagal menyimpan'); return }
      showSuccess(t('admin.jadwal.msgBerhasilEdit'))
    } else {
      const { error } = await useFetch('/api/admin/jadwal-pelajaran', { method: 'POST', body })
      if (error.value) { showError(error.value.statusMessage || 'Gagal menyimpan'); return }
      showSuccess(t('admin.jadwal.msgBerhasilTambah'))
    }
    showModal.value = false
    confirmClose.value = false
    await refresh()
  } finally { saving.value = false }
}

function promptDelete(item: Jadwal) {
  confirmDelete.value = { id: item.id, mapel: item.mapel }
}

async function handleDelete() {
  if (!confirmDelete.value) return
  const { id } = confirmDelete.value
  confirmDelete.value = null
  const { error } = await useFetch(`/api/admin/jadwal-pelajaran/${id}`, { method: 'DELETE' })
  if (error.value) { showError(error.value.statusMessage || 'Gagal menghapus'); return }
  showSuccess(t('admin.jadwal.msgBerhasilHapus'))
  await refresh()
}
</script>

<template>
  <AppLayout>
    <PageHeader :title="t('admin.jadwal.title')" :description="t('admin.jadwal.desc')" />

    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div class="flex flex-wrap items-center gap-2">
        <select v-model="filterHari"
          class="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px]">
          <option :value="undefined">{{ t('admin.jadwal.semuaHari') }}</option>
          <option v-for="h in hariList" :key="h" :value="h">{{ hariLabel(h) }}</option>
        </select>

        <select v-model="filterKelasId"
          class="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px]">
          <option :value="undefined">{{ t('admin.jadwal.semuaKelas') }}</option>
          <option v-for="k in kelasList" :key="k.id" :value="k.id">{{ k.nama }}</option>
        </select>

        <select v-model="filterGuruId"
          class="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[160px]">
          <option :value="undefined">{{ t('admin.jadwal.semuaPtk') }}</option>
          <option v-for="g in guruList" :key="g.id" :value="g.id">{{ g.nama }}</option>
        </select>

        <button @click="applyFilter"
          class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm inline-flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {{ t('admin.jadwal.filter') }}
        </button>
        <button v-if="activeFilterCount > 0" @click="resetFilter"
          class="px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 text-sm inline-flex items-center gap-1.5">
          {{ t('common.aturUlang') }}
          <span class="inline-flex items-center justify-center w-5 h-5 text-xs bg-blue-600 text-white rounded-lg">{{ activeFilterCount }}</span>
        </button>
      </div>
      <button @click="openCreate"
        class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm ">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span class="hidden sm:inline">{{ t('admin.jadwal.tambahJadwal') }}</span>
      </button>
    </div>

    <Notification type="error" :message="errorMsg" :show="!!errorMsg" @dismiss="errorMsg = ''" />
    <Notification type="success" :message="successMsg" :show="!!successMsg" @dismiss="successMsg = ''" />

    <LoadingSkeleton v-if="pending" type="table" :rows="5" :columns="7" />

    <div v-else class="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
      <div class="overflow-x-auto scrollbar-thin">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
              <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.jadwal.colMapel') }}</th>
              <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.jadwal.colHari') }}</th>
              <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.jadwal.colJam') }}</th>
              <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden sm:table-cell">{{ t('admin.jadwal.colKelas') }}</th>
              <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden md:table-cell">{{ t('admin.jadwal.colRuangan') }}</th>
                <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden lg:table-cell">{{ t('admin.jadwal.colPtk') }}</th>
              <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.tahunAjaran.colAksi') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
            <tr v-for="item in jadwalList" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
              <td class="px-4 py-3  text-gray-900 dark:text-gray-100">{{ item.mapel }}</td>
              <td class="px-4 py-3">
                <BaseBadge variant="blue" size="sm">{{ hariLabel(item.hari) }}</BaseBadge>
              </td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs">{{ item.jamMulai }} - {{ item.jamSelesai }}</td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">{{ item.kelas.nama }}</td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell">{{ item.ruangan.nama }}</td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs hidden lg:table-cell">{{ item.guru.nama }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1">
                  <button @click="openEdit(item)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-lg" :title="t('common.edit')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="promptDelete(item)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" :title="t('common.hapus')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!jadwalList || jadwalList.length === 0">
              <td colspan="7" class="px-4 py-16 text-center">
                <svg class="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="text-gray-500 dark:text-gray-400 ">{{ t('admin.jadwal.empty') }}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <BaseModal :show="showModal" :title="editing ? t('admin.jadwal.modalEdit') : t('admin.jadwal.modalCreate')" @close="handleCloseClick" max-w="max-w-lg">
      <form @submit.prevent="handleSave" class="space-y-4">
        <BaseFormField :label="t('admin.jadwal.labelMapel')" required>
          <input v-model="form.mapel" type="text" @input="onFormChange" required
            :placeholder="t('admin.jadwal.placeholderMapel')"
            class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
        </BaseFormField>

        <div class="grid grid-cols-2 gap-4">
          <BaseFormField :label="t('admin.jadwal.labelHari')" required>
            <select v-model="form.hari" @change="onFormChange" required
              class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700">
              <option v-for="h in hariList" :key="h" :value="h">{{ hariLabel(h) }}</option>
            </select>
          </BaseFormField>

          <BaseFormField :label="t('admin.jadwal.labelKelas')" required>
            <select v-model="form.kelasId" @change="onFormChange" required
              class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700">
              <option :value="0" disabled>{{ t('admin.jadwal.pilihKelas') }}</option>
              <option v-for="k in kelasList" :key="k.id" :value="k.id">{{ k.nama }}</option>
            </select>
          </BaseFormField>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <BaseFormField :label="t('admin.jadwal.labelJamMulai')" required>
            <input v-model="form.jamMulai" type="time" @input="onFormChange" required
              class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" />
          </BaseFormField>

          <BaseFormField :label="t('admin.jadwal.labelJamSelesai')" required>
            <input v-model="form.jamSelesai" type="time" @input="onFormChange" required
              class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" />
          </BaseFormField>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <BaseFormField :label="t('admin.jadwal.labelRuangan')" required>
            <select v-model="form.ruanganId" @change="onFormChange" required
              class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700">
              <option :value="0" disabled>{{ t('admin.jadwal.pilihRuangan') }}</option>
              <option v-for="r in ruanganList" :key="r.id" :value="r.id">{{ r.nama }}</option>
            </select>
          </BaseFormField>

          <BaseFormField :label="t('admin.jadwal.labelPtk')" required>
            <select v-model="form.guruId" @change="onFormChange" required
              class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700">
              <option :value="0" disabled>{{ t('admin.jadwal.pilihPtk') }}</option>
              <option v-for="g in guruList" :key="g.id" :value="g.id">{{ g.nama }}</option>
            </select>
          </BaseFormField>
        </div>
      </form>
      <template #footer>
        <button type="button" @click="handleCloseClick" class="px-4 py-2 text-sm  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">{{ t('common.batal') }}</button>
        <button type="submit" @click="handleSave" :disabled="saving"
          class="px-5 py-2 text-sm  text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2">
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          {{ saving ? t('common.menyimpan') : t('common.simpan') }}
        </button>
      </template>
    </BaseModal>

    <ConfirmDialog
      :show="!!confirmDelete"
      :title="t('admin.jadwal.confirmDeleteTitle')"
      :message="t('admin.jadwal.confirmDeleteMsg', { mapel: confirmDelete?.mapel })"
      variant="danger"
      @confirm="handleDelete"
      @cancel="confirmDelete = null"
    />
  </AppLayout>
</template>
