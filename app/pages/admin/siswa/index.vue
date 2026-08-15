<script setup lang="ts">
interface Siswa {
  id: number
  nisn: string
  nama: string
  kelasId: number
  nomorHp1: string | null
  nomorHp2: string | null
  namaWali: string | null
  kontakWali: string | null
  kelas: { id: number; nama: string }
  user: { email: string; isActive: boolean }
  createdAt: string
}

const { t } = useI18n()

const searchQuery = ref('')
const filterKelas = ref(0)
const sortOrder = ref('')
const page = ref(1)
const pageSize = 10

function toggleSort() {
  sortOrder.value = sortOrder.value === 'abjad' ? '' : 'abjad'
  page.value = 1
}

// Urutan data: abjad = A-Z, default (off) = urutan dari server
const displayData = computed(() => {
  const rows = siswaList.value || []
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

watch([searchQuery, filterKelas], () => { page.value = 1 })

const { data: siswaList, pending, refresh } = useFetch<Siswa[]>(() => {
  const params = new URLSearchParams()
  if (searchQuery.value) params.set('search', searchQuery.value)
  if (filterKelas.value) params.set('kelasId', String(filterKelas.value))
  return `/api/admin/siswa?${params.toString()}`
}, { immediate: true })
const { data: kelasList } = useFetch<{ id: number; nama: string }[]>('/api/admin/kelas', { immediate: true })

const showModal = ref(false)
const editing = ref<Siswa | null>(null)
const form = ref({ nama: '', nisn: '', email: '', kelasId: 0, namaWali: '', kontakWali: '', nomorHp1: '', nomorHp2: '' })
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
  form.value = { nama: '', nisn: '', email: '', kelasId: 0, namaWali: '', kontakWali: '', nomorHp1: '', nomorHp2: '' }
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
    kontakWali: item.kontakWali || '',
    nomorHp1: item.nomorHp1 || '',
    nomorHp2: item.nomorHp2 || ''
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
      if (form.value.nomorHp1 !== (editing.value.nomorHp1 || '')) body.nomorHp1 = form.value.nomorHp1 || null
      if (form.value.nomorHp2 !== (editing.value.nomorHp2 || '')) body.nomorHp2 = form.value.nomorHp2 || null

      if (Object.keys(body).length === 0) { showModal.value = false; return }

      const { error } = await useFetch(`/api/admin/siswa/${editing.value.id}`, { method: 'PATCH', body })
      if (error.value) { showError(error.value.statusMessage || 'Gagal menyimpan'); return }
      showSuccess(t('admin.siswa.msgBerhasilEdit'))
    } else {
      const { data: result, error } = await useFetch('/api/admin/siswa', {
        method: 'POST',
        body: {
          nama: form.value.nama,
          nisn: form.value.nisn,
          email: form.value.email,
          kelasId: form.value.kelasId,
          namaWali: form.value.namaWali || undefined,
          kontakWali: form.value.kontakWali || undefined,
          nomorHp1: form.value.nomorHp1 || undefined,
          nomorHp2: form.value.nomorHp2 || undefined
        }
      })
      if (error.value) { showError(error.value.statusMessage || 'Gagal menyimpan'); return }
      if (result.value?.generatedPassword) {
        generatedPassword.value = result.value.generatedPassword
        showPasswordModal.value = true
      }
      showSuccess(t('admin.siswa.msgBerhasilTambah'))
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
  showSuccess(t('admin.siswa.msgBerhasilHapus'))
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
    showSuccess(t('admin.guru.msgBerhasilReset'))
  } catch (err: any) {
    showError(err?.data?.statusMessage || 'Gagal reset password')
  } finally {
    resettingPw.value = false
  }
}

async function copyPassword() {
  const ok = await copyToClipboard(generatedPassword.value)
  if (ok) {
    showSuccess(t('admin.guru.msgPasswordTersalin'))
  } else {
    showError(t('admin.guru.msgGagalSalin'))
  }
}
</script>

<template>
  <AppLayout>
    <PageHeader :title="t('admin.siswa.title')" :description="t('admin.siswa.desc')" />

    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="searchQuery" type="text" :placeholder="t('admin.siswa.searchPlaceholder')"
            class="w-40 sm:w-56 pl-9 pr-3 py-2 border admin-accent-border rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400" />
        </div>
        <select v-model="filterKelas"
          class="px-3 py-2 border admin-accent-border rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option :value="0">{{ t('admin.jadwal.semuaKelas') }}</option>
          <option v-for="k in kelasList" :key="k.id" :value="k.id">{{ k.nama }}</option>
        </select>
        <button
          role="switch"
          :aria-checked="sortOrder === 'abjad'"
          @click="toggleSort()"
          :class="sortOrder === 'abjad'
            ? 'bg-blue-600 text-white ring-1 ring-blue-300 shadow-sm'
            : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'"
          class="inline-flex items-center gap-2.5 pl-3 pr-4 h-[38px] rounded-lg text-sm font-medium transition-colors select-none"
          :title="sortOrder === 'abjad' ? t('admin.siswa.namaAz') : t('admin.siswa.namaAzOff')">
          <span :class="sortOrder === 'abjad' ? 'bg-white/25' : 'bg-gray-200 dark:bg-slate-600'"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200">
            <span :class="sortOrder === 'abjad' ? 'translate-x-[22px]' : 'translate-x-[3px]'"
              class="inline-block h-5 w-5 transform rounded-full bg-white dark:bg-slate-300 shadow-md transition-all duration-200" />
          </span>
          <span>{{ t('admin.siswa.namaAz') }}</span>
        </button>
      </div>
      <button @click="openCreate"
        class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm ">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span class="hidden sm:inline">{{ t('admin.siswa.tambahMurid') }}</span>
      </button>
    </div>

    <Notification type="error" :message="errorMsg" :show="!!errorMsg" @dismiss="errorMsg = ''" />
    <Notification type="success" :message="successMsg" :show="!!successMsg" @dismiss="successMsg = ''" />

    <!-- Loading -->
    <LoadingSkeleton v-if="pending" type="table" :rows="5" :columns="6" />

    <!-- Table -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg border admin-accent-border overflow-hidden">
      <div class="overflow-x-auto scrollbar-thin">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 dark:bg-slate-700/50 border-b admin-accent-border">
              <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.guru.colNama') }}</th>
              <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden sm:table-cell">{{ t('admin.siswa.colNisn') }}</th>
              <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden md:table-cell">{{ t('admin.jadwal.colKelas') }}</th>
              <th class="text-left px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden lg:table-cell">{{ t('admin.siswa.colWali') }}</th>
              <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden xl:table-cell">{{ t('admin.guru.colNoHp') }}</th>
              <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.tahunAjaran.colStatus') }}</th>
              <th class="text-center px-4 py-3  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.tahunAjaran.colAksi') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y admin-accent-divide">
            <tr v-for="item in visibleData" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
              <td class="px-4 py-3">
                <span class=" text-gray-900 dark:text-gray-100">{{ item.nama }}</span>
                <div class="text-xs text-gray-400 dark:text-gray-500 sm:hidden">{{ item.nisn }}</div>
              </td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">{{ item.nisn }}</td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-300 hidden md:table-cell">{{ item.kelas?.nama || '-' }}</td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs hidden lg:table-cell">{{ item.namaWali || '-' }}</td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs text-center hidden xl:table-cell">{{ item.nomorHp1 || item.nomorHp2 ? (item.nomorHp1 || '-') : '-' }}</td>
              <td class="px-4 py-3 text-center">
                <BaseBadge :variant="item.user.isActive ? 'green' : 'gray'" size="sm" :dot="item.user.isActive">
                  {{ item.user.isActive ? t('admin.tahunAjaran.aktif') : t('admin.tahunAjaran.tidakAktif') }}
                </BaseBadge>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1">
                  <button @click="openEdit(item)" class="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" :title="t('common.edit')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <!-- Reset Password -->
                  <button @click="promptResetPassword(item)"
                    class="p-2 text-gray-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-md transition-all duration-150"
                    :title="t('admin.guru.resetPwTitle').replace('{name}', item.nama)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </button>

                  <button @click="promptDelete(item)" class="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md" :title="t('common.hapus')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <!-- Empty state -->
            <tr v-if="!siswaList || siswaList.length === 0">
              <td colspan="7" class="px-4 py-16 text-center">
                <svg class="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5zm0-7l-9-5 9-5 9 5-9 5z" />
                </svg>
                <p class="text-gray-500 dark:text-gray-400 ">{{ t('admin.siswa.empty') }}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="(siswaList || []).length > pageSize" class="px-4 sm:px-6 py-3 border-t admin-accent-border flex items-center justify-between gap-3">
        <p class="text-xs text-gray-400 dark:text-gray-500">
          {{ t('common.menampilkan', { from: ((page - 1) * pageSize) + 1, to: Math.min(page * pageSize, (siswaList || []).length), total: (siswaList || []).length, unit: t('admin.siswa.unitMurid') }) }}
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

    <!-- Modal Create/Edit -->
    <BaseModal :show="showModal" :title="editing ? t('admin.siswa.modalEdit') : t('admin.siswa.modalCreate')" @close="handleCloseClick">
      <form @submit.prevent="handleSave" class="space-y-4">
        <BaseFormField :label="t('admin.guru.labelNama')" required :error="undefined">
          <input v-model="form.nama" type="text" @input="onFormChange" required
            :placeholder="t('admin.siswa.placeholderNama')"
            class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
        </BaseFormField>

        <div class="grid grid-cols-2 gap-4">
          <BaseFormField :label="t('admin.siswa.labelNisn')" required>
            <input v-model="form.nisn" type="text" @input="onFormChange" required
              :placeholder="t('admin.siswa.placeholderNisn')"
              class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
          </BaseFormField>

          <BaseFormField :label="t('admin.jadwal.labelKelas')" required>
            <select v-model="form.kelasId" @change="onFormChange" required
              class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700">
              <option :value="0" disabled>{{ t('admin.jadwal.pilihKelas') }}</option>
              <option v-for="k in kelasList" :key="k.id" :value="k.id">{{ k.nama }}</option>
            </select>
          </BaseFormField>
        </div>

        <BaseFormField :label="t('admin.siswa.labelEmailLogin')">
          <input v-model="form.email" type="email" @input="onFormChange"
            :placeholder="t('admin.guru.placeholderEmail')"
            class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
        </BaseFormField>

        <div class="grid grid-cols-2 gap-4">
          <BaseFormField :label="t('admin.siswa.labelNamaWali')">
            <input v-model="form.namaWali" type="text" @input="onFormChange"
              :placeholder="t('admin.siswa.placeholderNamaWali')"
              class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
          </BaseFormField>

          <BaseFormField :label="t('admin.siswa.labelKontakWali')">
            <input v-model="form.kontakWali" type="text" @input="onFormChange"
              :placeholder="t('admin.siswa.placeholderKontakWali')"
              class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
          </BaseFormField>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <BaseFormField :label="t('admin.siswa.labelNoHp1')">
            <input v-model="form.nomorHp1" type="text" @input="onFormChange"
              :placeholder="t('admin.siswa.placeholderHpMurid')"
              class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
          </BaseFormField>

          <BaseFormField :label="t('admin.siswa.labelNoHp2')">
            <input v-model="form.nomorHp2" type="text" @input="onFormChange"
              :placeholder="t('admin.guru.placeholderHp2')"
              class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
          </BaseFormField>
        </div>

        <Transition name="fade">
          <div v-if="!editing" class="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ t('admin.siswa.infoPassword') }}</span>
          </div>
        </Transition>

        <Teleport to="body">
          <Transition name="fade">
            <div v-if="errorMsg && showModal" class="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
              <span>{{ errorMsg }}</span>
            </div>
          </Transition>
        </Teleport>
      </form>
      <template #footer>
        <button type="button" @click="handleCloseClick" class="px-4 py-2 text-sm  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">Batal</button>
        <button type="submit" @click="handleSave" :disabled="saving"
          class="px-5 py-2 text-sm  text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2">
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          {{ saving ? 'Menyimpan...' : 'Simpan' }}
        </button>
      </template>
    </BaseModal>

    <!-- Modal Password -->
    <BaseModal :show="showPasswordModal" title="Password Generated" max-w="max-w-sm" @close="showPasswordModal = false">
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Password untuk akun murid. Salin dan sampaikan ke murid.</p>
      <div class="flex items-center gap-2 p-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg mb-4">
        <code class="flex-1 text-lg font-mono  text-center text-gray-900 dark:text-gray-100 tracking-wider select-all">{{ generatedPassword }}</code>
      </div>
      <template #footer>
        <button @click="showPasswordModal = false" class="px-4 py-2 text-sm  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">Tutup</button>
        <button @click="copyPassword" class="px-4 py-2 text-sm  text-white bg-blue-600 rounded-md hover:bg-blue-700 inline-flex items-center gap-1.5">
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
        <div class="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm mx-auto p-4 border border-gray-300 dark:border-gray-600">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
              <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg  text-gray-900 dark:text-gray-100">Reset Password</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ resetPasswordFor.nama }}</p>
            </div>
          </div>

          <p class="text-sm text-gray-600 dark:text-gray-400 mb-5">
            Password baru akan digenerate otomatis. Password lama tidak bisa digunakan lagi. Lanjutkan?
          </p>

          <div class="flex justify-end gap-3">
            <button @click="resetPasswordFor = null"
              class="px-4 py-2 text-sm  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors">
              Batal
            </button>
            <button @click="handleResetPassword" :disabled="resettingPw"
              class="px-4 py-2 text-sm  text-white bg-amber-600 rounded-md hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 inline-flex items-center gap-2">
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
      title="Hapus Data Murid"
      :message="`Yakin ingin menghapus ${confirmDelete?.nama}?`"
      variant="danger"
      @confirm="handleDelete"
      @cancel="confirmDelete = null"
    />
  </AppLayout>
</template>
