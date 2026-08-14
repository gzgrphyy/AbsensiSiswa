<script setup lang="ts">
interface PtkPendamping {
  id: number
  nama: string
  nip: string | null
  nomorHp: string | null
  keterangan: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: { jadwalPelajaran: number }
}

const { t } = useI18n()

const showInactive = ref(false)
const searchQuery = ref('')
const sortOrder = ref('')
const page = ref(1)
const pageSize = 10

function toggleSort() {
  sortOrder.value = sortOrder.value === 'abjad' ? '' : 'abjad'
  page.value = 1
}

// Urutan data: abjad = A-Z, default (off) = urutan dari server
const displayData = computed(() => {
  const rows = data.value || []
  if (sortOrder.value === 'abjad') {
    return rows.slice().sort((a, b) => a.nama.localeCompare(b.nama))
  }
  return rows
})

const totalPages = computed(() => Math.max(1, Math.ceil(displayData.value.length / pageSize)))
const visibleData = computed(() => {
  const start = (page.value - 1) * pageSize
  return displayData.value.slice(start, start + pageSize)
})

watch([showInactive, searchQuery], () => { page.value = 1 })

const { data, pending, refresh } = useFetch<PtkPendamping[]>(() => {
  const params = new URLSearchParams()
  if (showInactive.value) params.set('showInactive', 'true')
  if (searchQuery.value) params.set('search', searchQuery.value)
  return `/api/admin/ptk-pendamping?${params.toString()}`
}, { immediate: true })

const showModal = ref(false)
const editing = ref<PtkPendamping | null>(null)
const form = ref({ nama: '', nip: '', nomorHp: '', keterangan: '' })
const saving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const confirmDelete = ref<{ id: number; nama: string } | null>(null)
const confirmToggle = ref<{ id: number; nama: string; active: boolean } | null>(null)
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
  form.value = { nama: '', nip: '', nomorHp: '', keterangan: '' }
  errorMsg.value = ''
  dirtyForm.value = false
  showModal.value = true
}

function openEdit(item: PtkPendamping) {
  editing.value = item
  form.value = {
    nama: item.nama,
    nip: item.nip || '',
    nomorHp: item.nomorHp || '',
    keterangan: item.keterangan || ''
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
      nama: form.value.nama,
      nip: form.value.nip || null,
      nomorHp: form.value.nomorHp || null,
      keterangan: form.value.keterangan || null
    }

    if (editing.value) {
      const { error } = await useFetch(`/api/admin/ptk-pendamping/${editing.value.id}`, { method: 'PATCH', body })
      if (error.value) { showError(error.value.statusMessage || 'Gagal menyimpan'); return }
      showSuccess(t('admin.ptkPendamping.msgBerhasilEdit'))
    } else {
      const { error } = await useFetch('/api/admin/ptk-pendamping', { method: 'POST', body })
      if (error.value) { showError(error.value.statusMessage || 'Gagal menyimpan'); return }
      showSuccess(t('admin.ptkPendamping.msgBerhasilTambah'))
    }
    showModal.value = false
    confirmClose.value = false
    await refresh()
  } finally { saving.value = false }
}

function promptDelete(item: PtkPendamping) {
  confirmDelete.value = { id: item.id, nama: item.nama }
}

async function handleDelete() {
  if (!confirmDelete.value) return
  const { id } = confirmDelete.value
  confirmDelete.value = null
  const { error } = await useFetch(`/api/admin/ptk-pendamping/${id}`, { method: 'DELETE' })
  if (error.value) { showError(error.value.statusMessage || 'Gagal menghapus'); return }
  showSuccess(t('admin.ptkPendamping.msgBerhasilHapus'))
  await refresh()
}

function promptToggle(item: PtkPendamping) {
  confirmToggle.value = { id: item.id, nama: item.nama, active: item.isActive }
}

async function handleToggleActive() {
  if (!confirmToggle.value) return
  const { id, active } = confirmToggle.value
  confirmToggle.value = null
  saving.value = true

  try {
    await $fetch(`/api/admin/ptk-pendamping/${id}/toggle-active`, {
      method: 'PATCH'
    })
    showSuccess(active ? t('admin.ptkPendamping.msgBerhasilNonaktif') : t('admin.ptkPendamping.msgBerhasilAktif'))
    await refresh()
  } catch (err: any) {
    showError(err?.data?.statusMessage || 'Gagal mengubah status')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AppLayout>
    <PageHeader :title="t('admin.ptkPendamping.title')" :description="t('admin.ptkPendamping.desc')" />

    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative flex-1 max-w-xs">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="searchQuery" type="text" :placeholder="t('admin.ptkPendamping.searchPlaceholder')"
            class="w-full pl-9 pr-3 py-2 border admin-accent-border rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400" />
        </div>
        <button
          role="switch"
          :aria-checked="sortOrder === 'abjad'"
          @click="toggleSort()"
          :class="sortOrder === 'abjad'
            ? 'bg-blue-600 text-white ring-1 ring-blue-300'
            : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'"
          class="inline-flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          :title="t('admin.ptkPendamping.namaAz')">
          <span :class="sortOrder === 'abjad' ? 'bg-white/20' : 'bg-gray-200 dark:bg-slate-600'"
            class="relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-200">
            <span :class="sortOrder === 'abjad' ? 'translate-x-[18px]' : 'translate-x-[2px]'"
              class="inline-block h-3.5 w-3.5 transform rounded-full bg-white dark:bg-slate-300 shadow-sm transition-all duration-200" />
          </span>
          <span>{{ t('admin.ptkPendamping.namaAz') }}</span>
        </button>
      </div>
      <div class="flex items-center gap-3">
        <label class="inline-flex items-center gap-2 cursor-pointer select-none group">
          <span class="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">{{ t('admin.ptkPendamping.tampilkanNonaktif') }}</span>
          <button
            role="switch"
            :aria-checked="showInactive"
            @click="showInactive = !showInactive"
            :class="showInactive
              ? 'bg-blue-600 ring-1 ring-blue-300'
              : 'bg-gray-200 dark:bg-slate-600 ring-1 ring-gray-300 dark:ring-slate-500'
            "
            class="relative inline-flex h-5 w-9 items-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
          >
            <span
              :class="showInactive ? 'translate-x-[18px]' : 'translate-x-[2px]'"
              class="inline-block h-3.5 w-3.5 transform rounded-full bg-white dark:bg-slate-300 shadow-sm transition-all duration-200"
            />
          </button>
        </label>
        <button @click="openCreate"
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm ">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden sm:inline">{{ t('admin.ptkPendamping.tambah') }}</span>
        </button>
      </div>
    </div>

    <Notification type="error" :message="errorMsg" :show="!!errorMsg" @dismiss="errorMsg = ''" />
    <Notification type="success" :message="successMsg" :show="!!successMsg" @dismiss="successMsg = ''" />

    <LoadingSkeleton v-if="pending" type="table" :rows="5" :columns="5" />

    <div v-else class="bg-white dark:bg-gray-800 rounded-lg border admin-accent-border overflow-hidden">
      <div class="overflow-x-auto scrollbar-thin">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 dark:bg-slate-700/50 border-b admin-accent-border">
              <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.ptkPendamping.colNama') }}</th>
              <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden sm:table-cell">{{ t('admin.ptkPendamping.colNip') }}</th>
              <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden md:table-cell">{{ t('admin.ptkPendamping.colNoHp') }}</th>
              <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden lg:table-cell">{{ t('admin.ptkPendamping.colKeterangan') }}</th>
              <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.tahunAjaran.colStatus') }}</th>
              <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.tahunAjaran.colAksi') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y admin-accent-divide">
            <tr v-for="item in visibleData" :key="item.id"
              class="transition-all duration-150"
              :class="item.isActive
                ? 'hover:bg-gray-50 dark:hover:bg-slate-700/30'
                : 'bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 border-l-2 border-l-gray-300 dark:border-l-gray-600'">
              <td class="px-4 py-3  text-gray-900 dark:text-gray-100" :class="{ 'text-gray-500 dark:text-gray-400': !item.isActive }">{{ item.nama }}</td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">{{ item.nip || '-' }}</td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell">{{ item.nomorHp || '-' }}</td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs hidden lg:table-cell">{{ item.keterangan || '-' }}</td>
              <td class="px-4 py-3 text-center">
                <BaseBadge :variant="item.isActive ? 'green' : 'gray'" size="sm" :dot="item.isActive">
                  {{ item.isActive ? t('admin.tahunAjaran.aktif') : t('admin.tahunAjaran.tidakAktif') }}
                </BaseBadge>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1">
                  <button @click="openEdit(item)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-md" :title="t('common.edit')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="promptToggle(item)"
                    :class="item.isActive
                      ? 'p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md'
                      : 'p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md'"
                    :title="item.isActive ? t('admin.ptkPendamping.nonaktifkanTitle') : t('admin.ptkPendamping.aktifkanTitle')">
                    <svg v-if="item.isActive" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button @click="promptDelete(item)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md" :title="t('common.hapus')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="(data || []).length === 0">
              <td colspan="6" class="px-4 py-16 text-center">
                <svg class="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="text-gray-500 dark:text-gray-400 ">{{ showInactive ? t('admin.ptkPendamping.emptyInactive') : t('admin.ptkPendamping.empty') }}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="(data || []).length > pageSize" class="px-4 sm:px-6 py-3 border-t admin-accent-border flex items-center justify-between gap-3">
        <p class="text-xs text-gray-400 dark:text-gray-500">
          {{ t('common.menampilkan', { from: ((page - 1) * pageSize) + 1, to: Math.min(page * pageSize, (data || []).length), total: (data || []).length, unit: t('admin.ptkPendamping.unit') }) }}
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
    </div>

    <!-- Modal -->
    <BaseModal :show="showModal" :title="editing ? t('admin.ptkPendamping.modalEdit') : t('admin.ptkPendamping.modalCreate')" @close="handleCloseClick">
      <form @submit.prevent="handleSave" class="space-y-4">
        <BaseFormField :label="t('admin.ptkPendamping.labelNama')" required>
          <input v-model="form.nama" type="text" @input="onFormChange" required
            :placeholder="t('admin.ptkPendamping.placeholderNama')"
            class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
        </BaseFormField>

        <BaseFormField :label="t('admin.ptkPendamping.labelNip')">
          <input v-model="form.nip" type="text" @input="onFormChange"
            :placeholder="t('admin.ptkPendamping.placeholderNip')"
            class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
        </BaseFormField>

        <BaseFormField :label="t('admin.ptkPendamping.labelNoHp')">
          <input v-model="form.nomorHp" type="text" @input="onFormChange"
            :placeholder="t('admin.ptkPendamping.placeholderNoHp')"
            class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
        </BaseFormField>

        <BaseFormField :label="t('admin.ptkPendamping.labelKeterangan')">
          <textarea v-model="form.keterangan" rows="2" @input="onFormChange"
            :placeholder="t('admin.ptkPendamping.placeholderKeterangan')"
            class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"></textarea>
        </BaseFormField>
      </form>
      <template #footer>
        <button type="button" @click="handleCloseClick" class="px-4 py-2 text-sm  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">{{ t('common.batal') }}</button>
        <button type="submit" @click="handleSave" :disabled="saving"
          class="px-5 py-2 text-sm  text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2">
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          {{ saving ? t('common.menyimpan') : t('common.simpan') }}
        </button>
      </template>
    </BaseModal>

    <ConfirmDialog
      :show="!!confirmDelete"
      :title="t('admin.ptkPendamping.confirmDeleteTitle')"
      :message="t('admin.ptkPendamping.confirmDeleteMsg', { nama: confirmDelete?.nama })"
      variant="danger"
      @confirm="handleDelete"
      @cancel="confirmDelete = null"
    />

    <ConfirmDialog
      :show="!!confirmToggle"
      :title="confirmToggle?.active ? t('admin.ptkPendamping.nonaktifkanTitle') : t('admin.ptkPendamping.aktifkanTitle')"
      :message="confirmToggle?.active ? t('admin.ptkPendamping.toggleNonaktifMsg', { nama: confirmToggle?.nama }) : t('admin.ptkPendamping.toggleAktifMsg', { nama: confirmToggle?.nama })"
      :confirm-label="confirmToggle?.active ? t('admin.ptkPendamping.yaNonaktifkan') : t('admin.ptkPendamping.yaAktifkan')"
      :variant="confirmToggle?.active ? 'danger' : 'success'"
      :loading="saving"
      @confirm="handleToggleActive"
      @cancel="confirmToggle = null"
    />
  </AppLayout>
</template>