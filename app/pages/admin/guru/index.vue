<script setup lang="ts">

interface Guru {
  id: number
  nama: string
  email: string
  nip: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: { kelasWali: number }
}

const showInactive = ref(false)

const { data, pending, refresh } = useFetch<Guru[]>('/api/admin/guru', {
  immediate: true,
  query: { showInactive },
  watch: [showInactive]
})

const showModal = ref(false)
const showPasswordModal = ref(false)
const editing = ref<Guru | null>(null)
const form = ref({ nama: '', email: '', nip: '' })
const saving = ref(false)
const generatedPassword = ref('')
const resetPasswordFor = ref<Guru | null>(null)
const confirmToggle = ref<{ id: number; nama: string; active: boolean } | null>(null)
const confirmClose = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
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
  form.value = { nama: '', email: '', nip: '' }
  errorMsg.value = ''
  successMsg.value = ''
  dirtyForm.value = false
  showModal.value = true
}

function openEdit(item: Guru) {
  editing.value = item
  form.value = {
    nama: item.nama,
    email: item.email,
    nip: item.nip || ''
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

async function handleSave() {
  saving.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    if (editing.value) {
      const body: Record<string, unknown> = {}
      if (form.value.nama !== editing.value.nama) body.nama = form.value.nama
      if (form.value.email !== editing.value.email) body.email = form.value.email
      if ((form.value.nip || null) !== editing.value.nip) body.nip = form.value.nip || null

      if (Object.keys(body).length === 0) {
        showModal.value = false
        return
      }

      const { error } = await useFetch(`/api/admin/guru/${editing.value.id}`, {
        method: 'PATCH',
        body
      })
      if (error.value) {
        showError(error.value.statusMessage || 'Gagal menyimpan')
        return
      }
      showSuccess('Data guru berhasil diperbarui')
    } else {
      const { data: result, error } = await useFetch('/api/admin/guru', {
        method: 'POST',
        body: {
          nama: form.value.nama,
          email: form.value.email,
          nip: form.value.nip || undefined
        }
      })
      if (error.value) {
        showError(error.value.statusMessage || 'Gagal menyimpan')
        return
      }
      if (result.value?.generatedPassword) {
        generatedPassword.value = result.value.generatedPassword
        showPasswordModal.value = true
      }
      showSuccess('Akun guru berhasil ditambahkan')
    }
    showModal.value = false
    confirmClose.value = false
    await refresh()
  } finally {
    saving.value = false
  }
}

async function handleResetPassword() {
  if (!resetPasswordFor.value) return
  saving.value = true
  errorMsg.value = ''

  try {
    const data = await $fetch(`/api/admin/guru/${resetPasswordFor.value.id}/reset-password`, {
      method: 'POST'
    })
    generatedPassword.value = data.generatedPassword
    showPasswordModal.value = true
    resetPasswordFor.value = null
    showSuccess('Password berhasil di-reset')
  } catch (err: any) {
    showError(err?.data?.statusMessage || 'Gagal reset password')
  } finally {
    saving.value = false
  }
}

async function handleToggleActive() {
  if (!confirmToggle.value) return
  const { id, active } = confirmToggle.value
  confirmToggle.value = null
  saving.value = true

  try {
    await $fetch(`/api/admin/guru/${id}/toggle-active`, {
      method: 'PATCH'
    })
    showSuccess(active ? 'Akun guru dinonaktifkan' : 'Akun guru diaktifkan')
    await refresh()
  } catch (err: any) {
    showError(err?.data?.statusMessage || 'Gagal mengubah status')
  } finally {
    saving.value = false
  }
}

function promptToggle(item: Guru) {
  confirmToggle.value = { id: item.id, nama: item.nama, active: item.isActive }
}

function promptResetPassword(item: Guru) {
  resetPasswordFor.value = item
}

function copyPassword() {
  navigator.clipboard.writeText(generatedPassword.value)
  showSuccess('Password berhasil disalin!')
}
</script>

<template>
  <AppLayout>
    <PageHeader title="Data Guru" description="Kelola akun guru dan hak akses">
      <template #actions>
        <button @click="openCreate"
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 active:bg-primary-700 text-sm font-medium shadow-sm transition-all duration-150">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden sm:inline">Tambah Guru</span>
        </button>
      </template>
    </PageHeader>

    <Notification type="error" :message="errorMsg" :show="!!errorMsg" @dismiss="errorMsg = ''" />
    <Notification type="success" :message="successMsg" :show="!!successMsg" @dismiss="successMsg = ''" />

    <!-- Filter toggle -->
      <div class="flex items-center justify-end mb-4">
        <label class="inline-flex items-center gap-2 cursor-pointer select-none group">
          <span class="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">Tampilkan nonaktif</span>
          <button
            role="switch"
            :aria-checked="showInactive"
            @click="showInactive = !showInactive"
            :class="showInactive
              ? 'bg-primary-500 ring-1 ring-primary-300'
              : 'bg-gray-200 dark:bg-slate-600 ring-1 ring-gray-300 dark:ring-slate-500'
            "
            class="relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1"
          >
            <span
              :class="showInactive ? 'translate-x-[18px]' : 'translate-x-[2px]'"
              class="inline-block h-3.5 w-3.5 transform rounded-full bg-white dark:bg-slate-300 shadow-sm transition-all duration-200"
            />
          </button>
        </label>
      </div>

      <!-- Loading skeleton -->
      <div v-if="pending" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-dark-card border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div class="p-6 space-y-4">
          <div v-for="i in 3" :key="i" class="flex items-center gap-4 animate-pulse">
            <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-40"></div>
            <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-52"></div>
            <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
            <div class="h-6 bg-gray-200 dark:bg-slate-700 rounded-full w-20"></div>
            <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20 ml-auto"></div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div v-else class="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-dark-card border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
                <th class="text-left px-4 sm:px-6 py-3.5 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Nama</th>
                <th class="text-left px-4 sm:px-6 py-3.5 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th class="text-center px-4 sm:px-6 py-3.5 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider hidden md:table-cell">NIP</th>
                <th class="text-center px-4 sm:px-6 py-3.5 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Status</th>
                <th class="text-center px-4 sm:px-6 py-3.5 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
              <tr v-for="item in data" :key="item.id"
                class="transition-all duration-150"
                :class="item.isActive
                  ? 'hover:bg-gray-50 dark:hover:bg-slate-700/30 border-l-4 border-l-transparent'
                  : 'bg-gray-50/50 dark:bg-slate-800/50 hover:bg-gray-100/50 dark:hover:bg-slate-700/50 border-l-4 border-l-gray-300 dark:border-l-slate-600'">
                <td class="px-4 sm:px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {{ item.nama.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <span class="font-medium text-gray-900 dark:text-gray-100" :class="{ 'text-gray-500 dark:text-gray-400': !item.isActive }">
                        {{ item.nama }}
                      </span>
                      <div class="text-xs text-gray-400 dark:text-gray-500 sm:hidden">{{ item.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 sm:px-6 py-4 hidden sm:table-cell">
                  <span class="text-gray-600 dark:text-gray-300" :class="{ 'text-gray-400 dark:text-gray-500': !item.isActive }">
                    {{ item.email }}
                  </span>
                </td>
                <td class="px-4 sm:px-6 py-4 text-center hidden md:table-cell">
                  <span class="text-gray-500 dark:text-gray-400" :class="{ 'text-gray-300 dark:text-gray-600': !item.isActive }">
                    {{ item.nip || '-' }}
                  </span>
                </td>
                <td class="px-4 sm:px-6 py-4 text-center">
                  <div class="flex items-center justify-center">
                    <span v-if="item.isActive"
                      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 ring-1 ring-green-200 dark:ring-green-800 shadow-sm">
                      <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      Aktif
                    </span>
                    <span v-else
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-slate-600">
                      Nonaktif
                    </span>
                  </div>
                </td>
                <td class="px-4 sm:px-6 py-4">
                  <div class="flex items-center justify-center gap-1">
                    <!-- Edit -->
                    <button @click="openEdit(item)"
                      class="p-2 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all duration-150"
                      :title="`Edit ${item.nama}`">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <!-- Reset Password -->
                    <button @click="promptResetPassword(item)"
                      class="p-2 text-gray-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-all duration-150"
                      :title="`Reset password ${item.nama}`">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </button>

                    <!-- Toggle Active -->
                    <button @click="promptToggle(item)"
                      :class="item.isActive
                        ? 'p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-150'
                        : 'p-2 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all duration-150'"
                      :title="item.isActive ? 'Nonaktifkan akun' : 'Aktifkan akun'">
                      <svg v-if="item.isActive" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="!data || data.length === 0">
                <td colspan="5" class="px-4 sm:px-6 py-16 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <svg class="w-12 h-12 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p class="text-gray-500 dark:text-gray-400 font-medium">Belum ada data guru</p>
                    <button @click="openCreate"
                      class="inline-flex items-center gap-1 px-4 py-2 text-sm text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Tambah sekarang
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
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="handleCloseClick"></div>

          <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl dark:shadow-2xl w-full max-w-md mx-auto overflow-hidden border border-gray-100 dark:border-slate-700">
            <div class="flex items-center justify-between px-6 pt-6 pb-2">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {{ editing ? 'Edit Data Guru' : 'Tambah Guru Baru' }}
              </h2>
              <button @click="handleCloseClick"
                class="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form @submit.prevent="handleSave" class="p-6 space-y-5">
              <!-- Nama Lengkap -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Nama Lengkap <span class="text-red-500">*</span>
                </label>
                <input v-model="form.nama" type="text" @input="onFormChange"
                  placeholder="Nama lengkap guru"
                  class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow placeholder:text-gray-400 dark:placeholder:text-gray-500" />
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email <span class="text-red-500">*</span>
                </label>
                <input v-model="form.email" type="email" @input="onFormChange"
                  placeholder="email@sekolah.sch.id"
                  class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow placeholder:text-gray-400 dark:placeholder:text-gray-500" />
              </div>

              <!-- NIP -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">NIP (opsional)</label>
                <input v-model="form.nip" type="text" @input="onFormChange"
                  placeholder="Nomor Induk Pegawai"
                  class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow placeholder:text-gray-400 dark:placeholder:text-gray-500" />
              </div>

              <!-- Info create -->
              <Transition name="fade">
                <div v-if="!editing" class="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg text-sm text-primary-700 dark:text-primary-300">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Password akan digenerate otomatis dan ditampilkan setelah simpan</span>
                </div>
              </Transition>

              <!-- Error -->
              <Transition name="fade">
                <div v-if="errorMsg" class="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ errorMsg }}</span>
                </div>
              </Transition>

              <!-- Actions -->
              <div class="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-slate-700">
                <button type="button" @click="handleCloseClick"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  Batal
                </button>
                <button type="submit" :disabled="saving"
                  class="px-5 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 active:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all duration-150 inline-flex items-center gap-2">
                  <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {{ saving ? 'Menyimpan...' : 'Simpan' }}
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
          <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl dark:shadow-2xl w-full max-w-sm mx-auto p-6 border border-gray-100 dark:border-slate-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Batalkan perubahan?</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-5">Perubahan yang belum disimpan akan hilang.</p>
            <div class="flex justify-end gap-3">
              <button @click="confirmClose = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                Lanjutkan Edit
              </button>
              <button @click="showModal = false; confirmClose = false"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Modal Show Password -->
      <Transition name="modal">
        <div v-if="showPasswordModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="showPasswordModal = false"></div>
          <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl dark:shadow-2xl w-full max-w-sm mx-auto p-6 border border-gray-100 dark:border-slate-700">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Password Generated</h2>
            </div>

            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Password untuk akun ini. Salin dan sampaikan ke guru yang bersangkutan.
            </p>

            <div class="flex items-center gap-2 p-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg mb-4">
              <code class="flex-1 text-lg font-mono font-bold text-center text-gray-900 dark:text-gray-100 tracking-wider select-all">
                {{ generatedPassword }}
              </code>
            </div>

            <div class="flex justify-end gap-3">
              <button @click="showPasswordModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                Tutup
              </button>
              <button @click="copyPassword"
                class="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 active:bg-primary-700 shadow-sm transition-all duration-150 inline-flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Salin Password
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Modal Confirm Toggle Active -->
      <Transition name="modal">
        <div v-if="confirmToggle" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="confirmToggle = null"></div>
          <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl dark:shadow-2xl w-full max-w-sm mx-auto p-6 border border-gray-100 dark:border-slate-700">
            <div class="flex items-center gap-3 mb-4">
              <div :class="confirmToggle.active ? 'p-2 bg-red-100 dark:bg-red-900/30 rounded-full' : 'p-2 bg-green-100 dark:bg-green-900/30 rounded-full'">
                <svg v-if="confirmToggle.active" class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <svg v-else class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {{ confirmToggle.active ? 'Nonaktifkan Akun' : 'Aktifkan Akun' }}
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ confirmToggle.nama }}</p>
              </div>
            </div>

            <p v-if="confirmToggle.active" class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Guru ini tidak akan bisa login sampai diaktifkan kembali. Data kelas dan absensi tetap aman.
            </p>
            <p v-else class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Guru ini akan bisa login kembali setelah diaktifkan.
            </p>

            <div class="flex justify-end gap-3">
              <button @click="confirmToggle = null"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                Batal
              </button>
              <button @click="handleToggleActive"
                :class="confirmToggle.active
                  ? 'px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-150'
                  : 'px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-150'">
                {{ confirmToggle.active ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Modal Confirm Reset Password -->
      <Transition name="modal">
        <div v-if="resetPasswordFor" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="resetPasswordFor = null"></div>
          <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl dark:shadow-2xl w-full max-w-sm mx-auto p-6 border border-gray-100 dark:border-slate-700">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Reset Password</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ resetPasswordFor.nama }}</p>
              </div>
            </div>

            <p class="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Password baru akan digenerate otomatis. Password lama tidak bisa digunakan lagi. Lanjutkan?
            </p>

            <div class="flex justify-end gap-3">
              <button @click="resetPasswordFor = null"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                Batal
              </button>
              <button @click="handleResetPassword"
                class="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 active:bg-amber-800 shadow-sm transition-all duration-150">
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AppLayout>
</template>

<style scoped>
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
