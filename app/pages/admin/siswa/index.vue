<script setup lang="ts">
interface Siswa {
  id: number
  nisn: string
  nama: string
  kelasId: number
  namaWali: string | null
  kontakWali: string | null
  kelas: { id: number; nama: string }
  user: { email: string; isActive: boolean }
  createdAt: string
}

const { data: siswaList, pending, refresh } = useFetch<Siswa[]>('/api/admin/siswa', { immediate: true })
const { data: kelasList } = useFetch<{ id: number; nama: string }[]>('/api/admin/kelas', { immediate: true })

const showModal = ref(false)
const editing = ref<Siswa | null>(null)
const form = ref({ nama: '', nisn: '', email: '', kelasId: 0, namaWali: '', kontakWali: '' })
const saving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const confirmDelete = ref<{ id: number; nama: string } | null>(null)
const confirmClose = ref(false)
const dirtyForm = ref(false)
const generatedPassword = ref('')
const showPasswordModal = ref(false)
const resetPasswordFor = ref<Siswa | null>(null)
const resettingPw = ref(false)

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
  form.value = { nama: '', nisn: '', email: '', kelasId: 0, namaWali: '', kontakWali: '' }
  errorMsg.value = ''
  dirtyForm.value = false
  showModal.value = true
}

function openEdit(item: Siswa) {
  editing.value = item
  form.value = {
    nama: item.nama,
    nisn: item.nisn,
    email: item.user.email,
    kelasId: item.kelasId,
    namaWali: item.namaWali || '',
    kontakWali: item.kontakWali || ''
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
    if (editing.value) {
      const body: Record<string, unknown> = {}
      if (form.value.nama !== editing.value.nama) body.nama = form.value.nama
      if (form.value.nisn !== editing.value.nisn) body.nisn = form.value.nisn
      if (form.value.email !== editing.value.user.email) body.email = form.value.email
      if (form.value.kelasId !== editing.value.kelasId) body.kelasId = form.value.kelasId
      if (form.value.namaWali !== (editing.value.namaWali || '')) body.namaWali = form.value.namaWali || null
      if (form.value.kontakWali !== (editing.value.kontakWali || '')) body.kontakWali = form.value.kontakWali || null

      if (Object.keys(body).length === 0) { showModal.value = false; return }

      const { error } = await useFetch(`/api/admin/siswa/${editing.value.id}`, { method: 'PATCH', body })
      if (error.value) { showError(error.value.statusMessage || 'Gagal menyimpan'); return }
      showSuccess('Data siswa berhasil diperbarui')
    } else {
      const { data: result, error } = await useFetch('/api/admin/siswa', {
        method: 'POST',
        body: {
          nama: form.value.nama,
          nisn: form.value.nisn,
          email: form.value.email,
          kelasId: form.value.kelasId,
          namaWali: form.value.namaWali || undefined,
          kontakWali: form.value.kontakWali || undefined
        }
      })
      if (error.value) { showError(error.value.statusMessage || 'Gagal menyimpan'); return }
      if (result.value?.generatedPassword) {
        generatedPassword.value = result.value.generatedPassword
        showPasswordModal.value = true
      }
      showSuccess('Akun siswa berhasil ditambahkan')
    }
    showModal.value = false
    confirmClose.value = false
    await refresh()
  } finally { saving.value = false }
}

function promptDelete(item: Siswa) {
  confirmDelete.value = { id: item.id, nama: item.nama }
}

async function handleDelete() {
  if (!confirmDelete.value) return
  const { id } = confirmDelete.value
  confirmDelete.value = null
  const { error } = await useFetch(`/api/admin/siswa/${id}`, { method: 'DELETE' })
  if (error.value) { showError(error.value.statusMessage || 'Gagal menghapus'); return }
  showSuccess('Data siswa berhasil dihapus')
  await refresh()
}

function promptResetPassword(item: Siswa) {
  resetPasswordFor.value = item
}

async function handleResetPassword() {
  if (!resetPasswordFor.value) return
  resettingPw.value = true
  errorMsg.value = ''

  try {
    const data = await $fetch(`/api/admin/siswa/${resetPasswordFor.value.id}/reset-password`, {
      method: 'POST'
    })
    generatedPassword.value = data.generatedPassword
    showPasswordModal.value = true
    resetPasswordFor.value = null
    showSuccess('Password berhasil di-reset')
  } catch (err: any) {
    showError(err?.data?.statusMessage || 'Gagal reset password')
  } finally {
    resettingPw.value = false
  }
}

function copyPassword() {
  navigator.clipboard.writeText(generatedPassword.value)
  showSuccess('Password berhasil disalin!')
}
</script>

<template>
  <AppLayout>
    <PageHeader title="Data Siswa" description="Kelola data siswa dan akun">
      <template #actions>
        <button @click="openCreate"
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 text-sm font-medium">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden sm:inline">Tambah Siswa</span>
        </button>
      </template>
    </PageHeader>

    <Notification type="error" :message="errorMsg" :show="!!errorMsg" @dismiss="errorMsg = ''" />
    <Notification type="success" :message="successMsg" :show="!!successMsg" @dismiss="successMsg = ''" />

    <!-- Loading -->
    <LoadingSkeleton v-if="pending" type="table" :rows="5" :columns="6" />

    <!-- Table -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-sm border border-gray-300 dark:border-gray-600 overflow-hidden">
      <div class="overflow-x-auto scrollbar-thin">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
              <th class="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Nama</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider hidden sm:table-cell">NISN</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider hidden md:table-cell">Kelas</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider hidden lg:table-cell">Wali</th>
              <th class="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Status</th>
              <th class="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
            <tr v-for="item in siswaList" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-semibold">
                    {{ item.nama.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <span class="font-medium text-gray-900 dark:text-gray-100">{{ item.nama }}</span>
                    <div class="text-xs text-gray-400 dark:text-gray-500 sm:hidden">{{ item.nisn }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">{{ item.nisn }}</td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-300 hidden md:table-cell">{{ item.kelas?.nama || '-' }}</td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs hidden lg:table-cell">{{ item.namaWali || '-' }}</td>
              <td class="px-4 py-3 text-center">
                <BaseBadge :variant="item.user.isActive ? 'green' : 'gray'" size="sm">
                  {{ item.user.isActive ? 'Aktif' : 'Nonaktif' }}
                </BaseBadge>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1">
                  <button @click="openEdit(item)" class="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm" title="Edit">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <!-- Reset Password -->
                  <button @click="promptResetPassword(item)"
                    class="p-2 text-gray-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-sm transition-all duration-150"
                    title="Reset password">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </button>

                  <button @click="promptDelete(item)" class="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-sm" title="Hapus">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <!-- Empty state -->
            <tr v-if="!siswaList || siswaList.length === 0">
              <td colspan="6" class="px-4 py-16 text-center">
                <svg class="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5zm0-7l-9-5 9-5 9 5-9 5z" />
                </svg>
                <p class="text-gray-500 dark:text-gray-400 font-medium">Belum ada data siswa</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Create/Edit -->
    <BaseModal :show="showModal" :title="editing ? 'Edit Data Siswa' : 'Tambah Siswa Baru'" @close="handleCloseClick">
      <form @submit.prevent="handleSave" class="space-y-4">
        <BaseFormField label="Nama Lengkap" required :error="undefined">
          <input v-model="form.nama" type="text" @input="onFormChange" required
            placeholder="Nama lengkap siswa"
            class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
        </BaseFormField>

        <div class="grid grid-cols-2 gap-4">
          <BaseFormField label="NISN" required>
            <input v-model="form.nisn" type="text" @input="onFormChange" required
              placeholder="Nomor Induk"
              class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
          </BaseFormField>

          <BaseFormField label="Kelas" required>
            <select v-model="form.kelasId" @change="onFormChange" required
              class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700">
              <option :value="0" disabled>Pilih kelas</option>
              <option v-for="k in kelasList" :key="k.id" :value="k.id">{{ k.nama }}</option>
            </select>
          </BaseFormField>
        </div>

        <BaseFormField label="Email (untuk login)">
          <input v-model="form.email" type="email" @input="onFormChange"
            placeholder="email@sekolah.sch.id"
            class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
        </BaseFormField>

        <div class="grid grid-cols-2 gap-4">
          <BaseFormField label="Nama Wali">
            <input v-model="form.namaWali" type="text" @input="onFormChange"
              placeholder="Nama orang tua/wali"
              class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
          </BaseFormField>

          <BaseFormField label="Kontak Wali">
            <input v-model="form.kontakWali" type="text" @input="onFormChange"
              placeholder="No. telepon"
              class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
          </BaseFormField>
        </div>

        <Transition name="fade">
          <div v-if="!editing" class="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-sm text-sm text-blue-700 dark:text-blue-300">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Password akan digenerate otomatis</span>
          </div>
        </Transition>

        <Teleport to="body">
          <Transition name="fade">
            <div v-if="errorMsg && showModal" class="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-sm text-sm text-red-700 dark:text-red-300">
              <span>{{ errorMsg }}</span>
            </div>
          </Transition>
        </Teleport>
      </form>
      <template #footer>
        <button type="button" @click="handleCloseClick" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">Batal</button>
        <button type="submit" @click="handleSave" :disabled="saving"
          class="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-sm hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2">
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          {{ saving ? 'Menyimpan...' : 'Simpan' }}
        </button>
      </template>
    </BaseModal>

    <!-- Modal Password -->
    <BaseModal :show="showPasswordModal" title="Password Generated" max-w="max-w-sm" @close="showPasswordModal = false">
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Password untuk akun siswa. Salin dan sampaikan ke siswa.</p>
      <div class="flex items-center gap-2 p-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg mb-4">
        <code class="flex-1 text-lg font-mono font-bold text-center text-gray-900 dark:text-gray-100 tracking-wider select-all">{{ generatedPassword }}</code>
      </div>
      <template #footer>
        <button @click="showPasswordModal = false" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">Tutup</button>
        <button @click="copyPassword" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-sm hover:bg-blue-700 inline-flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Salin Password
        </button>
      </template>
    </BaseModal>

    <!-- Modal Confirm Reset Password -->
    <Transition name="fade">
      <div v-if="resetPasswordFor" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="resetPasswordFor = null"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-sm w-full max-w-sm mx-auto p-4 border border-gray-300 dark:border-gray-600">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full">
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
            <button @click="handleResetPassword" :disabled="resettingPw"
              class="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-sm hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 inline-flex items-center gap-2">
              <svg v-if="resettingPw" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Ya, Reset
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal Confirm Delete -->
    <ConfirmDialog
      :show="!!confirmDelete"
      title="Hapus Data Siswa"
      :message="`Yakin ingin menghapus ${confirmDelete?.nama}?`"
      variant="danger"
      @confirm="handleDelete"
      @cancel="confirmDelete = null"
    />
  </AppLayout>
</template>
