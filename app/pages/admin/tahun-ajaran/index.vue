<script setup lang="ts">

interface TahunAjaran {
  id: number
  nama: string
  semester: 'GANJIL' | 'GENAP'
  isActive: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  _count: { kelas: number }
}

const { t } = useI18n()

const { data, pending, refresh } = useFetch<TahunAjaran[]>('/api/admin/tahun-ajaran', {
  immediate: true
})

const showModal = ref(false)
const editing = ref<TahunAjaran | null>(null)
const form = ref({ nama: '', semester: 'GANJIL' as 'GANJIL' | 'GENAP', setActive: false })
const saving = ref(false)
const confirmToggle = ref<{ id: number; nama: string; active: boolean } | null>(null)
const confirmDelete = ref<{ id: number; nama: string; kelasCount: number } | null>(null)
const confirmClose = ref<boolean>(false)
const errorMsg = ref('')
const successMsg = ref('')
const dirtyForm = ref(false)

const semesterLabel = (s: 'GANJIL' | 'GENAP') => s === 'GANJIL' ? t('semester.ganjil') : t('semester.genap')
const fullLabel = (item: { nama: string; semester: 'GANJIL' | 'GENAP' }) =>
  `${item.nama} ${semesterLabel(item.semester)}`

function openCreate() {
  editing.value = null
  form.value = { nama: '', semester: 'GANJIL', setActive: false }
  errorMsg.value = ''
  successMsg.value = ''
  dirtyForm.value = false
  showModal.value = true
}

function openEdit(item: TahunAjaran) {
  editing.value = item
  form.value = {
    nama: item.nama,
    semester: item.semester,
    setActive: false
  }
  errorMsg.value = ''
  successMsg.value = ''
  dirtyForm.value = false
  showModal.value = true
}

function onFormChange() {
  dirtyForm.value = true
}

function handleCloseClick() {
  if (dirtyForm.value) {
    confirmClose.value = true
  } else {
    showModal.value = false
  }
}

function showError(msg: string) {
  errorMsg.value = msg
  setTimeout(() => { errorMsg.value = '' }, 5000)
}

function showSuccess(msg: string) {
  successMsg.value = msg
  setTimeout(() => { successMsg.value = '' }, 3000)
}

async function handleSave() {
  saving.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    if (editing.value) {
      const body: Record<string, unknown> = {}
      const hasKelas = editing.value._count.kelas > 0
      if (!hasKelas) {
        body.nama = form.value.nama
        body.semester = form.value.semester
      }
      if (form.value.setActive) {
        body.isActive = true
      }
      if (Object.keys(body).length === 0) {
        showModal.value = false
        return
      }
      const { error } = await useFetch(`/api/admin/tahun-ajaran/${editing.value.id}`, {
        method: 'PATCH',
        body
      })
      if (error.value) {
        showError(error.value.statusMessage || 'Gagal menyimpan')
        return
      }
      showSuccess(t('admin.tahunAjaran.msgBerhasilEdit'))
      confirmClose.value = false
    } else {
      const { error } = await useFetch('/api/admin/tahun-ajaran', {
        method: 'POST',
        body: form.value
      })
      if (error.value) {
        showError(error.value.statusMessage || 'Gagal menyimpan')
        return
      }
      showSuccess(t('admin.tahunAjaran.msgBerhasilTambah'))
    }
    showModal.value = false
    await refresh()
  } finally {
    saving.value = false
  }
}

async function handleToggle() {
  if (!confirmToggle.value) return
  const { id } = confirmToggle.value
  confirmToggle.value = null

  const { error } = await useFetch(`/api/admin/tahun-ajaran/${id}`, {
    method: 'PATCH',
    body: { isActive: true }
  })
  if (error.value) {
    showError(error.value.statusMessage || 'Gagal mengubah status')
    return
  }
  showSuccess(t('admin.tahunAjaran.msgBerhasilPindahAktif'))
  await refresh()
}

async function handleDelete() {
  if (!confirmDelete.value) return
  const { id } = confirmDelete.value
  confirmDelete.value = null

  const { error } = await useFetch(`/api/admin/tahun-ajaran/${id}`, {
    method: 'DELETE'
  })
  if (error.value) {
    showError(error.value.statusMessage || 'Gagal menghapus')
    return
  }
  showSuccess(t('admin.tahunAjaran.msgBerhasilHapus'))
  await refresh()
}

function promptToggle(item: TahunAjaran) {
  confirmToggle.value = { id: item.id, nama: fullLabel(item), active: item.isActive }
}

function promptDelete(item: TahunAjaran) {
  confirmDelete.value = { id: item.id, nama: fullLabel(item), kelasCount: item._count.kelas }
}
</script>

<template>
  <AppLayout>
    <PageHeader :title="t('admin.tahunAjaran.title')" :description="t('admin.tahunAjaran.desc')">
      <template #actions>
        <button @click="openCreate"
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 active:bg-primary-800 text-sm ">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden sm:inline">{{ t('common.tambah') }}</span>
        </button>
      </template>
    </PageHeader>

    <Notification type="error" :message="errorMsg" :show="!!errorMsg" @dismiss="errorMsg = ''" />
    <Notification type="success" :message="successMsg" :show="!!successMsg" @dismiss="successMsg = ''" />

      <!-- Loading skeleton -->
      <div v-if="pending" class="bg-white dark:bg-gray-800 rounded-lg border admin-accent-border overflow-hidden">
        <div class="p-6 space-y-4">
          <div v-for="i in 3" :key="i" class="flex items-center gap-4 animate-pulse">
            <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
            <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
            <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-12 ml-auto"></div>
            <div class="h-6 bg-gray-200 dark:bg-slate-700 rounded-lg w-20"></div>
            <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24 ml-auto"></div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-lg border admin-accent-border overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-slate-700/50 border-b admin-accent-border">
                <th class="text-left px-4 sm:px-6 py-3.5  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.tahunAjaran.colTahunAjaran') }}</th>
                <th class="text-left px-4 sm:px-6 py-3.5  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden sm:table-cell">{{ t('admin.tahunAjaran.colSemester') }}</th>
                <th class="text-center px-4 sm:px-6 py-3.5  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.tahunAjaran.colKelas') }}</th>
                <th class="text-center px-4 sm:px-6 py-3.5  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.tahunAjaran.colStatus') }}</th>
                <th class="text-center px-4 sm:px-6 py-3.5  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.tahunAjaran.colAksi') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y admin-accent-divide">
              <tr v-for="item in data" :key="item.id"
                class="transition-all duration-150"
                :class="item.isActive
                  ? 'border-l-2 border-l-green-500 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'">
                <td class="px-4 sm:px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span class=" text-gray-900 dark:text-gray-100">{{ item.nama }}</span>
                    <span class="sm:hidden text-xs text-gray-500 dark:text-gray-400">
                      {{ semesterLabel(item.semester) }}
                    </span>
                  </div>
                </td>
                <td class="px-4 sm:px-6 py-4 hidden sm:table-cell">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-slate-600">
                    {{ semesterLabel(item.semester) }}
                  </span>
                </td>
                <td class="px-4 sm:px-6 py-4 text-center">
                  <span class="text-gray-600 ">{{ item._count.kelas }}</span>
                </td>
                <td class="px-4 sm:px-6 py-4 text-center">
                  <BaseBadge :variant="item.isActive ? 'green' : 'gray'" size="sm" :dot="item.isActive" :pulse="item.isActive">
                    {{ item.isActive ? t('admin.tahunAjaran.aktif') : t('admin.tahunAjaran.tidakAktif') }}
                  </BaseBadge>
                </td>
                <td class="px-4 sm:px-6 py-4">
                  <div class="flex items-center justify-center gap-1">
                    <!-- Edit -->
                    <button @click="openEdit(item)"
                      class="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-md transition-all duration-150"
                      :title="t('admin.tahunAjaran.editTitle', { name: fullLabel(item) })">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <!-- Activate (only if not active) -->
                    <button v-if="!item.isActive" @click="promptToggle(item)"
                      class="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-md transition-all duration-150"
                      :title="t('admin.tahunAjaran.aktifkanTitle', { name: fullLabel(item) })">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>

                    <!-- Active indicator icon -->
                    <span v-else class="p-2 text-green-500 cursor-default" :title="t('admin.tahunAjaran.sedangAktif')">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>

                    <!-- Delete (only if not active) -->
                    <button v-if="!item.isActive" @click="promptDelete(item)"
                      class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-150"
                      :title="t('admin.tahunAjaran.hapusTitle', { name: fullLabel(item) })">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="!data || data.length === 0">
                <td colspan="5" class="px-4 sm:px-6 py-16 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p class="text-gray-500 ">{{ t('admin.tahunAjaran.empty') }}</p>
                    <button @click="openCreate"
                      class="inline-flex items-center gap-1 px-4 py-2 text-sm text-primary-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      {{ t('admin.tahunAjaran.emptyAction') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    <!-- Modal Create/Edit -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="handleCloseClick">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="handleCloseClick"></div>

          <div class="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-auto overflow-hidden border border-gray-300 dark:border-gray-600">
            <!-- Modal header -->
            <div class="flex items-center justify-between px-4 pt-4 pb-2">
              <h2 class="text-lg  text-gray-900 dark:text-gray-100">
                {{ editing ? t('admin.tahunAjaran.modalEdit') : t('admin.tahunAjaran.modalCreate') }}
              </h2>
              <button @click="handleCloseClick"
                class="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form @submit.prevent="handleSave" class="p-4 space-y-4">
              <!-- Nama -->
              <div>
                <label class="block text-sm  text-gray-700 dark:text-gray-300 mb-1.5">{{ t('admin.tahunAjaran.labelNama') }}</label>
                <input v-model="form.nama" type="text" @input="onFormChange"
                  :placeholder="t('admin.tahunAjaran.placeholderNama')"
                  :disabled="!!editing && editing._count.kelas > 0"
                  class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-shadow placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                <Transition name="fade">
                  <p v-if="editing && editing._count.kelas > 0" class="flex items-center gap-1 text-xs text-amber-600 mt-1.5">
                    <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    {{ t('admin.tahunAjaran.infoNamaTerkunci', { count: editing._count.kelas }) }}
                  </p>
                </Transition>
              </div>

              <!-- Semester -->
              <div>
                <label class="block text-sm  text-gray-700 dark:text-gray-300 mb-1.5">{{ t('admin.tahunAjaran.labelSemester') }}</label>
                <select v-model="form.semester" @change="onFormChange"
                  :disabled="!!editing && editing._count.kelas > 0"
                  class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-shadow appearance-none bg-white dark:bg-slate-700">
                  <option value="GANJIL">{{ t('semester.ganjil') }}</option>
                  <option value="GENAP">{{ t('semester.genap') }}</option>
                </select>
              </div>

              <!-- Set Active -->
              <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-100 dark:border-slate-600">
                <input id="setActive" v-model="form.setActive" type="checkbox" @change="onFormChange"
                  class="mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 transition-shadow" />
                <div class="flex flex-col">
                  <label for="setActive" class="text-sm  text-gray-700 dark:text-gray-300 cursor-pointer">
                    {{ editing ? t('admin.tahunAjaran.setAktifEdit') : t('admin.tahunAjaran.setAktifCreate') }}
                  </label>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {{ t('admin.tahunAjaran.infoAutoNonaktif') }}
                  </p>
                </div>
              </div>

              <!-- Edit mode info -->
              <Transition name="fade">
                <div v-if="editing && editing.isActive" class="flex items-center gap-2 p-3 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-700">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ t('admin.tahunAjaran.infoEditAktif') }}</span>
                </div>
              </Transition>

              <!-- Error -->
              <Transition name="fade">
                <div v-if="errorMsg" class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ errorMsg }}</span>
                </div>
              </Transition>

              <!-- Actions -->
              <div class="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-slate-700">
                <button type="button" @click="handleCloseClick"
                  class="px-4 py-2 text-sm  text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors">
                  {{ t('common.batal') }}
                </button>
                <button type="submit" :disabled="saving"
                  class="px-5 py-2 text-sm  text-white bg-primary-600 rounded-md hover:bg-primary-700 active:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2">
                  <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {{ saving ? t('common.menyimpan') : t('common.simpan') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>

      <!-- Modal Confirm Close -->
      <Transition name="modal">
        <div v-if="confirmClose" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="confirmClose = false"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm mx-auto p-4 border border-gray-300 dark:border-gray-600">
            <h2 class="text-lg  text-gray-900 dark:text-gray-100 mb-2">{{ t('admin.tahunAjaran.confirmCloseTitle') }}</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-5">{{ t('admin.tahunAjaran.confirmCloseMsg') }}</p>
            <div class="flex justify-end gap-3">
              <button @click="confirmClose = false"
                class="px-4 py-2 text-sm  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors">
                {{ t('admin.tahunAjaran.lanjutkanEdit') }}
              </button>
              <button @click="showModal = false; confirmClose = false"
                class="px-4 py-2 text-sm  text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
                {{ t('admin.tahunAjaran.yaBatalkan') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Modal Confirm Toggle -->
      <Transition name="modal">
        <div v-if="confirmToggle" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="confirmToggle = null"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm mx-auto p-4 border border-gray-300 dark:border-gray-600">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 class="text-lg  text-gray-900 dark:text-gray-100">{{ t('admin.tahunAjaran.confirmToggleTitle') }}</h2>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {{ t('admin.tahunAjaran.confirmToggleMsg', { name: confirmToggle.nama }) }}
            </p>
            <p class="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 rounded-lg p-3 mb-4">
              {{ t('admin.tahunAjaran.confirmToggleInfo') }}
            </p>
            <div class="flex justify-end gap-3">
              <button @click="confirmToggle = null"
                class="px-4 py-2 text-sm  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors">
                {{ t('common.batal') }}
              </button>
              <button @click="handleToggle"
                class="px-4 py-2 text-sm  text-white bg-green-600 rounded-md hover:bg-green-700 active:bg-green-800">
                {{ t('common.yaAktifkan') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Modal Confirm Delete -->
      <Transition name="modal">
        <div v-if="confirmDelete" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="confirmDelete = null"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm mx-auto p-4 border border-gray-300 dark:border-gray-600">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg  text-gray-900 dark:text-gray-100">{{ t('admin.tahunAjaran.confirmDeleteTitle') }}</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('admin.tahunAjaran.confirmDeleteSub') }}</p>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {{ t('admin.tahunAjaran.confirmDeleteMsg', { name: confirmDelete.nama }) }}
            </p>
            <div v-if="confirmDelete.kelasCount > 0"
              class="mt-3 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>
                {{ t('admin.tahunAjaran.confirmDeleteKelas', { count: confirmDelete.kelasCount }) }}
              </span>
            </div>
            <p v-else class="mt-3 text-sm text-gray-500 dark:text-gray-400">
              {{ t('admin.tahunAjaran.confirmDeleteTanpaKelas') }}
            </p>
            <div class="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-slate-700">
              <button @click="confirmDelete = null"
                class="px-4 py-2 text-sm  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors">
                {{ t('common.batal') }}
              </button>
              <button @click="handleDelete"
                class="px-4 py-2 text-sm  text-white bg-red-600 rounded-md hover:bg-red-700 active:bg-red-800">
                {{ t('common.yaHapus') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AppLayout>
</template>

<style scoped>
/* Modal transitions */
.modal-enter-active {
  transition: all 0.2s ease-out;
}
.modal-leave-active {
  transition: all 0.15s ease-in;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.95);
}
.modal-enter-from > div:first-child,
.modal-leave-to > div:first-child {
  opacity: 0;
}

/* Slide transitions for notifications */
.slide-enter-active {
  transition: all 0.3s ease-out;
}
.slide-leave-active {
  transition: all 0.2s ease-in;
}
.slide-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}
.slide-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
