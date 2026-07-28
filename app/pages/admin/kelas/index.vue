<script setup lang="ts">
interface Kelas {
  id: number
  nama: string
  waliKelasId: number | null
  tahunAjaranId: number
  waliKelas: { id: number; nama: string } | null
  tahunAjaran: { id: number; nama: string; semester: string }
  _count: { siswa: number; jadwalPelajaran: number }
}

const { data: kelasList, pending, refresh } = useFetch<Kelas[]>('/api/admin/kelas', { immediate: true })
const { data: guruList } = useFetch<{ id: number; nama: string }[]>('/api/admin/guru', { immediate: true })
const { data: taList } = useFetch<{ id: number; nama: string; semester: string; isActive: boolean }[]>('/api/admin/tahun-ajaran', { immediate: true })

const showModal = ref(false)
const editing = ref<Kelas | null>(null)
const form = ref({ nama: '', waliKelasId: 0, tahunAjaranId: 0 })
const saving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const confirmDelete = ref<{ id: number; nama: string } | null>(null)
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

const activeTa = computed(() => taList.value?.find(t => t.isActive))

function openCreate() {
  editing.value = null
  form.value = { nama: '', waliKelasId: 0, tahunAjaranId: activeTa.value?.id || 0 }
  errorMsg.value = ''
  dirtyForm.value = false
  showModal.value = true
}

function openEdit(item: Kelas) {
  editing.value = item
  form.value = {
    nama: item.nama,
    waliKelasId: item.waliKelasId || 0,
    tahunAjaranId: item.tahunAjaranId
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
      if ((form.value.waliKelasId || null) !== editing.value.waliKelasId) body.waliKelasId = form.value.waliKelasId || null
      if (form.value.tahunAjaranId !== editing.value.tahunAjaranId) body.tahunAjaranId = form.value.tahunAjaranId

      if (Object.keys(body).length === 0) { showModal.value = false; return }

      const { error } = await useFetch(`/api/admin/kelas/${editing.value.id}`, { method: 'PATCH', body })
      if (error.value) { showError(error.value.statusMessage || 'Gagal menyimpan'); return }
      showSuccess('Data kelas berhasil diperbarui')
    } else {
      const { error } = await useFetch('/api/admin/kelas', {
        method: 'POST',
        body: {
          nama: form.value.nama,
          waliKelasId: form.value.waliKelasId || undefined,
          tahunAjaranId: form.value.tahunAjaranId
        }
      })
      if (error.value) { showError(error.value.statusMessage || 'Gagal menyimpan'); return }
      showSuccess('Kelas berhasil ditambahkan')
    }
    showModal.value = false
    confirmClose.value = false
    await refresh()
  } finally { saving.value = false }
}

function promptDelete(item: Kelas) {
  confirmDelete.value = { id: item.id, nama: item.nama }
}

async function handleDelete() {
  if (!confirmDelete.value) return
  const { id } = confirmDelete.value
  confirmDelete.value = null
  const { error } = await useFetch(`/api/admin/kelas/${id}`, { method: 'DELETE' })
  if (error.value) { showError(error.value.statusMessage || 'Gagal menghapus'); return }
  showSuccess('Kelas berhasil dihapus')
  await refresh()
}
</script>

<template>
  <AppLayout>
    <PageHeader title="Data Kelas" description="Kelola kelas dan wali kelas">
      <template #actions>
        <button @click="openCreate"
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 text-sm font-medium">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden sm:inline">Tambah Kelas</span>
        </button>
      </template>
    </PageHeader>

    <Notification type="error" :message="errorMsg" :show="!!errorMsg" @dismiss="errorMsg = ''" />
    <Notification type="success" :message="successMsg" :show="!!successMsg" @dismiss="successMsg = ''" />

    <LoadingSkeleton v-if="pending" type="table" :rows="5" :columns="5" />

    <div v-else class="bg-white dark:bg-gray-800 rounded-sm border border-gray-300 dark:border-gray-600 overflow-hidden">
      <div class="overflow-x-auto scrollbar-thin">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
              <th class="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Nama Kelas</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider hidden sm:table-cell">Wali Kelas</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider hidden md:table-cell">Tahun Ajaran</th>
                <th class="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Murid</th>
              <th class="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
            <tr v-for="item in kelasList" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
              <td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{{ item.nama }}</td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">{{ item.waliKelas?.nama || '-' }}</td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs hidden md:table-cell">{{ item.tahunAjaran.nama }}</td>
              <td class="px-4 py-3 text-center">
                <span class="text-gray-700 dark:text-gray-200 font-medium">{{ item._count.siswa }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1">
                  <button @click="openEdit(item)" class="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm" title="Edit">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
            <tr v-if="!kelasList || kelasList.length === 0">
              <td colspan="5" class="px-4 py-16 text-center">
                <svg class="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p class="text-gray-500 dark:text-gray-400 font-medium">Belum ada data kelas</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <BaseModal :show="showModal" :title="editing ? 'Edit Kelas' : 'Tambah Kelas Baru'" @close="handleCloseClick">
      <form @submit.prevent="handleSave" class="space-y-4">
        <BaseFormField label="Nama Kelas" required>
          <input v-model="form.nama" type="text" @input="onFormChange" required
            placeholder="contoh: X-A, XI-B, XII-C"
            class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400" />
        </BaseFormField>

        <BaseFormField label="Wali Kelas">
          <select v-model="form.waliKelasId" @change="onFormChange"
            class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 bg-white">
            <option :value="0">Tidak ada</option>
            <option v-for="g in guruList" :key="g.id" :value="g.id">{{ g.nama }}</option>
          </select>
        </BaseFormField>

        <BaseFormField label="Tahun Ajaran" required>
          <select v-model="form.tahunAjaranId" @change="onFormChange" required
            class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 bg-white">
            <option v-for="t in taList" :key="t.id" :value="t.id">{{ t.nama }} ({{ t.semester }})</option>
          </select>
        </BaseFormField>
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

    <ConfirmDialog
      :show="!!confirmDelete"
      title="Hapus Kelas"
      :message="`Yakin ingin menghapus ${confirmDelete?.nama}?`"
      variant="danger"
      @confirm="handleDelete"
      @cancel="confirmDelete = null"
    />
  </AppLayout>
</template>
