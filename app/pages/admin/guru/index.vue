<script setup lang="ts">
interface Guru {
  id: number
  nama: string
  email: string
  nip: string | null
  nomorHp1: string | null
  nomorHp2: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: { kelasWali: number }
}

interface PtkPendamping {
  id: number
  nama: string
  nip: string | null
  nomorHp: string | null
  keterangan: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type Jenis = 'PTK' | 'PENDAMPING'
type JenisFilter = 'SEMUA' | Jenis

interface Row {
  key: string
  jenis: Jenis
  id: number
  nama: string
  email: string | null
  nip: string | null
  nomorHp: string | null
  keterangan: string | null
  isActive: boolean
}

const { t } = useI18n()

const showInactive = ref(false)
const searchQuery = ref('')
const sortOrder = ref('')
const jenisFilter = ref<JenisFilter>('SEMUA')
const page = ref(1)
const pageSize = 10

function toggleSort() {
  sortOrder.value = sortOrder.value === 'abjad' ? '' : 'abjad'
  page.value = 1
}

const jenisOptions = computed(() => [
  { value: 'SEMUA' as JenisFilter, label: t('common.semua') },
  { value: 'PTK' as JenisFilter, label: t('admin.guru.jenisPtk') },
  { value: 'PENDAMPING' as JenisFilter, label: t('admin.guru.jenisPendamping') }
])

const guruParams = computed(() => {
  const params = new URLSearchParams()
  if (showInactive.value) params.set('showInactive', 'true')
  if (searchQuery.value) params.set('search', searchQuery.value)
  return params.toString()
})

const { data: guruData, pending: guruPending, refresh: refreshGuru } = useFetch<Guru[]>(() => `/api/admin/guru?${guruParams.value}`, { immediate: true })
const { data: pendampingData, pending: pendampingPending, refresh: refreshPendamping } = useFetch<PtkPendamping[]>(() => `/api/admin/ptk-pendamping?${guruParams.value}`, { immediate: true })

const pending = computed(() => guruPending.value || pendampingPending.value)

// Gabungan data PTK + PTK pendamping
const rows = computed<Row[]>(() => {
  const all: Row[] = []
  for (const g of guruData.value || []) {
    all.push({
      key: `ptk-${g.id}`,
      jenis: 'PTK',
      id: g.id,
      nama: g.nama,
      email: g.email,
      nip: g.nip,
      nomorHp: g.nomorHp1 || g.nomorHp2,
      keterangan: null,
      isActive: g.isActive
    })
  }
  for (const p of pendampingData.value || []) {
    all.push({
      key: `pendamping-${p.id}`,
      jenis: 'PENDAMPING',
      id: p.id,
      nama: p.nama,
      email: null,
      nip: p.nip,
      nomorHp: p.nomorHp,
      keterangan: p.keterangan,
      isActive: p.isActive
    })
  }

  let result = all
  if (jenisFilter.value === 'PTK') result = result.filter(r => r.jenis === 'PTK')
  if (jenisFilter.value === 'PENDAMPING') result = result.filter(r => r.jenis === 'PENDAMPING')
  if (sortOrder.value === 'abjad') result = result.slice().sort((a, b) => a.nama.localeCompare(b.nama))
  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(rows.value.length / pageSize)))
const visibleData = computed(() => {
  const start = (page.value - 1) * pageSize
  return rows.value.slice(start, start + pageSize)
})

watch([showInactive, searchQuery, jenisFilter], () => { page.value = 1 })

const emptyMsg = computed(() => {
  if (jenisFilter.value === 'PENDAMPING') {
    return showInactive.value ? t('admin.ptkPendamping.emptyInactive') : t('admin.ptkPendamping.empty')
  }
  return showInactive.value ? t('admin.guru.emptyInactive') : t('admin.guru.empty')
})

const showModal = ref(false)
const showPasswordModal = ref(false)
const editingRow = ref<Row | null>(null)
const editingGuru = ref<Guru | null>(null)
const editingPendamping = ref<PtkPendamping | null>(null)
const form = ref({ jenis: 'PTK' as Jenis, nama: '', email: '', nip: '', nomorHp1: '', nomorHp2: '', nomorHp: '', keterangan: '' })
const saving = ref(false)
const generatedPassword = ref('')
const resetPasswordFor = ref<Guru | null>(null)
const confirmToggle = ref<{ jenis: Jenis; id: number; nama: string; active: boolean } | null>(null)
const confirmDelete = ref<{ id: number; nama: string } | null>(null)
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
  editingRow.value = null
  editingGuru.value = null
  editingPendamping.value = null
  form.value = { jenis: 'PTK', nama: '', email: '', nip: '', nomorHp1: '', nomorHp2: '', nomorHp: '', keterangan: '' }
  errorMsg.value = ''
  successMsg.value = ''
  dirtyForm.value = false
  showModal.value = true
}

function openEdit(item: Row) {
  editingRow.value = item
  editingGuru.value = null
  editingPendamping.value = null
  if (item.jenis === 'PTK') {
    editingGuru.value = guruData.value?.find(g => g.id === item.id) || null
  } else {
    editingPendamping.value = pendampingData.value?.find(p => p.id === item.id) || null
  }
  form.value = {
    jenis: item.jenis,
    nama: item.nama,
    email: editingGuru.value?.email || '',
    nip: item.nip || '',
    nomorHp1: editingGuru.value?.nomorHp1 || '',
    nomorHp2: editingGuru.value?.nomorHp2 || '',
    nomorHp: item.nomorHp || '',
    keterangan: item.keterangan || ''
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
    if (editingRow.value) {
      if (editingRow.value.jenis === 'PTK') {
        const guru = editingGuru.value
        if (!guru) return
        const body: Record<string, unknown> = {}
        if (form.value.nama !== guru.nama) body.nama = form.value.nama
        if (form.value.email !== guru.email) body.email = form.value.email
        if ((form.value.nip || null) !== guru.nip) body.nip = form.value.nip || null
        if ((form.value.nomorHp1 || null) !== guru.nomorHp1) body.nomorHp1 = form.value.nomorHp1 || null
        if ((form.value.nomorHp2 || null) !== guru.nomorHp2) body.nomorHp2 = form.value.nomorHp2 || null

        if (Object.keys(body).length === 0) {
          showModal.value = false
          return
        }

        const { error } = await useFetch(`/api/admin/guru/${guru.id}`, {
          method: 'PATCH',
          body
        })
        if (error.value) {
          showError(error.value.statusMessage || 'Gagal menyimpan')
          return
        }
        showSuccess(t('admin.guru.msgBerhasilEdit'))
      } else {
        const pendamping = editingPendamping.value
        if (!pendamping) return
        const body = {
          nama: form.value.nama,
          nip: form.value.nip || null,
          nomorHp: form.value.nomorHp || null,
          keterangan: form.value.keterangan || null
        }
        const { error } = await useFetch(`/api/admin/ptk-pendamping/${pendamping.id}`, {
          method: 'PATCH',
          body
        })
        if (error.value) {
          showError(error.value.statusMessage || 'Gagal menyimpan')
          return
        }
        showSuccess(t('admin.ptkPendamping.msgBerhasilEdit'))
      }
    } else {
      if (form.value.jenis === 'PTK') {
        const { data: result, error } = await useFetch('/api/admin/guru', {
          method: 'POST',
          body: {
            nama: form.value.nama,
            email: form.value.email,
            nip: form.value.nip || undefined,
            nomorHp1: form.value.nomorHp1 || undefined,
            nomorHp2: form.value.nomorHp2 || undefined
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
        showSuccess(t('admin.guru.msgBerhasilTambah'))
      } else {
        const { error } = await useFetch('/api/admin/ptk-pendamping', {
          method: 'POST',
          body: {
            nama: form.value.nama,
            nip: form.value.nip || null,
            nomorHp: form.value.nomorHp || null,
            keterangan: form.value.keterangan || null
          }
        })
        if (error.value) {
          showError(error.value.statusMessage || 'Gagal menyimpan')
          return
        }
        showSuccess(t('admin.ptkPendamping.msgBerhasilTambah'))
      }
    }
    showModal.value = false
    confirmClose.value = false
    await Promise.all([refreshGuru(), refreshPendamping()])
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
    showSuccess(t('admin.guru.msgBerhasilReset'))
  } catch (err: any) {
    showError(err?.data?.statusMessage || 'Gagal reset password')
  } finally {
    saving.value = false
  }
}

function promptToggle(item: Row) {
  confirmToggle.value = { jenis: item.jenis, id: item.id, nama: item.nama, active: item.isActive }
}

async function handleToggleActive() {
  if (!confirmToggle.value) return
  const { jenis, id, active } = confirmToggle.value
  confirmToggle.value = null
  saving.value = true

  try {
    if (jenis === 'PTK') {
      await $fetch(`/api/admin/guru/${id}/toggle-active`, {
        method: 'PATCH'
      })
      showSuccess(active ? t('admin.guru.msgBerhasilNonaktif') : t('admin.guru.msgBerhasilAktif'))
    } else {
      await $fetch(`/api/admin/ptk-pendamping/${id}/toggle-active`, {
        method: 'PATCH'
      })
      showSuccess(active ? t('admin.ptkPendamping.msgBerhasilNonaktif') : t('admin.ptkPendamping.msgBerhasilAktif'))
    }
    await Promise.all([refreshGuru(), refreshPendamping()])
  } catch (err: any) {
    showError(err?.data?.statusMessage || 'Gagal mengubah status')
  } finally {
    saving.value = false
  }
}

function promptResetPassword(item: Row) {
  const guru = guruData.value?.find(g => g.id === item.id)
  if (guru) resetPasswordFor.value = guru
}

function promptDelete(item: Row) {
  confirmDelete.value = { id: item.id, nama: item.nama }
}

async function handleDelete() {
  if (!confirmDelete.value) return
  const { id } = confirmDelete.value
  confirmDelete.value = null
  const { error } = await useFetch(`/api/admin/ptk-pendamping/${id}`, { method: 'DELETE' })
  if (error.value) { showError(error.value.statusMessage || 'Gagal menghapus'); return }
  showSuccess(t('admin.ptkPendamping.msgBerhasilHapus'))
  await Promise.all([refreshGuru(), refreshPendamping()])
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
    <PageHeader :title="t('admin.guru.title')" :description="t('admin.guru.desc')" />

    <Notification type="error" :message="errorMsg" :show="!!errorMsg" @dismiss="errorMsg = ''" />
    <Notification type="success" :message="successMsg" :show="!!successMsg" @dismiss="successMsg = ''" />

    <!-- Filter -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative flex-1 max-w-xs">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input v-model="searchQuery" type="text" :placeholder="t('admin.guru.searchPlaceholder')"
              class="w-full pl-9 pr-3 py-2 border admin-accent-border rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400" />
          </div>
          <button
            role="switch"
            :aria-checked="sortOrder === 'abjad'"
            @click="toggleSort()"
            :class="sortOrder === 'abjad'
              ? 'bg-blue-600 text-white ring-1 ring-blue-300 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'"
            class="inline-flex items-center gap-2.5 pl-3 pr-4 h-[38px] rounded-lg text-sm font-medium transition-colors select-none"
            :title="sortOrder === 'abjad' ? t('admin.guru.namaAz') : t('admin.guru.namaAzOff')">
            <span :class="sortOrder === 'abjad' ? 'bg-white/25' : 'bg-gray-200 dark:bg-slate-600'"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200">
              <span :class="sortOrder === 'abjad' ? 'translate-x-[22px]' : 'translate-x-[3px]'"
                class="inline-block h-5 w-5 transform rounded-full bg-white dark:bg-slate-300 shadow-md transition-all duration-200" />
            </span>
            <span>{{ t('admin.guru.namaAz') }}</span>
          </button>
          <div class="inline-flex items-center rounded-lg border admin-accent-border bg-white dark:bg-slate-800 p-0.5">
            <button
              v-for="opt in jenisOptions"
              :key="opt.value"
              @click="jenisFilter = opt.value"
              :class="jenisFilter === opt.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'"
              class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors select-none">
              {{ opt.label }}
            </button>
          </div>
        </div>
        <div class="flex items-center gap-3">
        <label class="inline-flex items-center gap-2 cursor-pointer select-none group">
          <span class="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">{{ t('admin.guru.tampilkanNonaktif') }}</span>
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
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 text-sm ">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden sm:inline">{{ t('admin.guru.tambahPtk') }}</span>
        </button>
      </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="pending" class="bg-white dark:bg-gray-800 rounded-lg border admin-accent-border overflow-hidden">
        <div class="p-4 space-y-4">
          <div v-for="i in 3" :key="i" class="flex items-center gap-4 animate-pulse">
            <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-40"></div>
            <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-52"></div>
            <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
            <div class="h-6 bg-gray-200 dark:bg-slate-700 rounded-lg w-20"></div>
            <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20 ml-auto"></div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-lg border admin-accent-border overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-gray-50 dark:bg-slate-700/50 border-b admin-accent-border">
                <th class="text-left px-4 sm:px-6 py-3.5  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.guru.colJenis') }}</th>
                <th class="text-left px-4 sm:px-6 py-3.5  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.guru.colNama') }}</th>
                <th class="text-left px-4 sm:px-6 py-3.5  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden sm:table-cell">{{ t('admin.guru.colEmail') }}</th>
                <th class="text-center px-4 sm:px-6 py-3.5  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden md:table-cell">{{ t('admin.guru.colNip') }}</th>
                <th class="text-center px-4 sm:px-6 py-3.5  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden lg:table-cell">{{ t('admin.guru.colNoHp') }}</th>
                <th class="text-left px-4 sm:px-6 py-3.5  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden xl:table-cell">{{ t('admin.ptkPendamping.colKeterangan') }}</th>
                <th class="text-center px-4 sm:px-6 py-3.5  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.tahunAjaran.colStatus') }}</th>
                <th class="text-center px-4 sm:px-6 py-3.5  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.tahunAjaran.colAksi') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y admin-accent-divide">
              <tr v-for="item in visibleData" :key="item.key"
                class="transition-all duration-150"
                :class="item.isActive
                  ? 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                  : 'bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 border-l-2 border-l-gray-300 dark:border-l-gray-600'">
                <td class="px-4 sm:px-6 py-4">
                  <BaseBadge :variant="item.jenis === 'PTK' ? 'blue' : 'purple'" size="sm">
                    {{ item.jenis === 'PTK' ? t('admin.guru.jenisPtk') : t('admin.guru.jenisPendamping') }}
                  </BaseBadge>
                </td>
                <td class="px-4 sm:px-6 py-4">
                  <span class=" text-gray-900 dark:text-gray-100" :class="{ 'text-gray-500 dark:text-gray-400': !item.isActive }">
                    {{ item.nama }}
                  </span>
                  <div v-if="item.jenis === 'PTK'" class="text-xs text-gray-400 dark:text-gray-500 sm:hidden">{{ item.email }}</div>
                </td>
                <td class="px-4 sm:px-6 py-4 hidden sm:table-cell">
                  <span class="text-gray-600 dark:text-gray-300" :class="{ 'text-gray-400 dark:text-gray-500': !item.isActive }">
                    {{ item.email || '-' }}
                  </span>
                </td>
                <td class="px-4 sm:px-6 py-4 text-center hidden md:table-cell">
                  <span class="text-gray-500 dark:text-gray-400" :class="{ 'text-gray-300 dark:text-gray-600': !item.isActive }">
                    {{ item.nip || '-' }}
                  </span>
                </td>
                <td class="px-4 sm:px-6 py-4 text-center hidden lg:table-cell">
                  <span class="text-gray-500 dark:text-gray-400 text-xs" :class="{ 'text-gray-300 dark:text-gray-600': !item.isActive }">
                    {{ item.nomorHp || '-' }}
                  </span>
                </td>
                <td class="px-4 sm:px-6 py-4 hidden xl:table-cell">
                  <span class="text-gray-500 dark:text-gray-400 text-xs" :class="{ 'text-gray-300 dark:text-gray-600': !item.isActive }">
                    {{ item.keterangan || '-' }}
                  </span>
                </td>
                <td class="px-4 sm:px-6 py-4 text-center">
                  <BaseBadge :variant="item.isActive ? 'green' : 'gray'" size="sm" :dot="item.isActive">
                    {{ item.isActive ? t('admin.tahunAjaran.aktif') : t('admin.tahunAjaran.tidakAktif') }}
                  </BaseBadge>
                </td>
                <td class="px-4 sm:px-6 py-4">
                  <div class="flex items-center justify-center gap-1">
                    <!-- Edit -->
                    <button @click="openEdit(item)"
                      class="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all duration-150"
                      :title="t('admin.guru.editTitle', { name: item.nama })">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <!-- Reset Password (PTK) -->
                    <button v-if="item.jenis === 'PTK'" @click="promptResetPassword(item)"
                      class="p-2 text-gray-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-md transition-all duration-150"
                      :title="t('admin.guru.resetPwTitle', { name: item.nama })">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </button>

                    <!-- Toggle Active -->
                    <button @click="promptToggle(item)"
                      :class="item.isActive
                        ? 'p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-all duration-150'
                        : 'p-2 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-md transition-all duration-150'"
                      :title="item.isActive ? t('admin.guru.nonaktifkanTitle') : t('admin.guru.aktifkanTitle')">
                      <svg v-if="item.isActive" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>

                    <!-- Delete (Pendamping) -->
                    <button v-if="item.jenis === 'PENDAMPING'" @click="promptDelete(item)"
                      class="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-all duration-150"
                      :title="t('common.hapus')">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="rows.length === 0">
                <td colspan="8" class="px-4 sm:px-6 py-16 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <svg class="w-12 h-12 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p class="text-gray-500 dark:text-gray-400 ">
                      {{ emptyMsg }}
                    </p>
                    <button v-if="!showInactive" @click="openCreate"
                      class="inline-flex items-center gap-1 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
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
        <div v-if="rows.length > pageSize" class="px-4 sm:px-6 py-3 border-t admin-accent-border flex items-center justify-between gap-3">
          <p class="text-xs text-gray-400 dark:text-gray-500">
            {{ t('common.menampilkan', { from: ((page - 1) * pageSize) + 1, to: Math.min(page * pageSize, rows.length), total: rows.length, unit: t('admin.guru.unitPtk') }) }}
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
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="handleCloseClick">
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="handleCloseClick"></div>

          <div class="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-auto overflow-hidden border border-gray-300 dark:border-gray-600">
            <div class="flex items-center justify-between px-4 pt-4 pb-2">
              <h2 class="text-lg  text-gray-900 dark:text-gray-100">
                {{ editingRow
                  ? (form.jenis === 'PTK' ? t('admin.guru.modalEdit') : t('admin.ptkPendamping.modalEdit'))
                  : (form.jenis === 'PTK' ? t('admin.guru.modalCreate') : t('admin.ptkPendamping.modalCreate')) }}
              </h2>
              <button @click="handleCloseClick"
                class="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form @submit.prevent="handleSave" class="p-4 space-y-4">
              <!-- Jenis (hanya saat tambah) -->
              <div v-if="!editingRow">
                <label class="block text-sm  text-gray-700 dark:text-gray-300 mb-1.5">
                  {{ t('admin.guru.labelJenis') }} <span class="text-red-500">*</span>
                </label>
                <select v-model="form.jenis" @change="onFormChange"
                  class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700">
                  <option value="PTK">{{ t('admin.guru.jenisPtk') }}</option>
                  <option value="PENDAMPING">{{ t('admin.guru.jenisPendamping') }}</option>
                </select>
              </div>

              <template v-if="form.jenis === 'PTK'">
                <!-- Nama Lengkap -->
                <div>
                  <label class="block text-sm  text-gray-700 dark:text-gray-300 mb-1.5">
                    {{ t('admin.guru.labelNama') }} <span class="text-red-500">*</span>
                  </label>
                  <input v-model="form.nama" type="text" @input="onFormChange"
                    :placeholder="t('admin.guru.placeholderNama')"
                    class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm  text-gray-700 dark:text-gray-300 mb-1.5">
                    {{ t('admin.guru.labelEmail') }} <span class="text-red-500">*</span>
                  </label>
                  <input v-model="form.email" type="email" @input="onFormChange"
                    :placeholder="t('admin.guru.placeholderEmail')"
                    class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                </div>

                <!-- NIP -->
                <div>
                  <label class="block text-sm  text-gray-700 dark:text-gray-300 mb-1.5">{{ t('admin.guru.labelNip') }}</label>
                  <input v-model="form.nip" type="text" @input="onFormChange"
                    :placeholder="t('admin.guru.placeholderNip')"
                    class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                </div>

                <!-- Nomor HP -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm  text-gray-700 dark:text-gray-300 mb-1.5">{{ t('admin.guru.labelNoHp1') }}</label>
                    <input v-model="form.nomorHp1" type="text" @input="onFormChange"
                      :placeholder="t('admin.guru.placeholderHp')"
                      class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                  </div>
                  <div>
                    <label class="block text-sm  text-gray-700 dark:text-gray-300 mb-1.5">{{ t('admin.guru.labelNoHp2') }}</label>
                    <input v-model="form.nomorHp2" type="text" @input="onFormChange"
                      :placeholder="t('admin.guru.placeholderHp2')"
                      class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                  </div>
                </div>

                <!-- Info create -->
                <Transition name="fade">
                  <div v-if="!editingRow" class="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{{ t('admin.guru.infoPassword') }}</span>
                  </div>
                </Transition>
              </template>

              <template v-else>
                <!-- Nama -->
                <div>
                  <label class="block text-sm  text-gray-700 dark:text-gray-300 mb-1.5">
                    {{ t('admin.ptkPendamping.labelNama') }} <span class="text-red-500">*</span>
                  </label>
                  <input v-model="form.nama" type="text" @input="onFormChange"
                    :placeholder="t('admin.ptkPendamping.placeholderNama')"
                    class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                </div>

                <!-- NIP -->
                <div>
                  <label class="block text-sm  text-gray-700 dark:text-gray-300 mb-1.5">{{ t('admin.ptkPendamping.labelNip') }}</label>
                  <input v-model="form.nip" type="text" @input="onFormChange"
                    :placeholder="t('admin.ptkPendamping.placeholderNip')"
                    class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                </div>

                <!-- Nomor HP -->
                <div>
                  <label class="block text-sm  text-gray-700 dark:text-gray-300 mb-1.5">{{ t('admin.ptkPendamping.labelNoHp') }}</label>
                  <input v-model="form.nomorHp" type="text" @input="onFormChange"
                    :placeholder="t('admin.ptkPendamping.placeholderNoHp')"
                    class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                </div>

                <!-- Keterangan -->
                <div>
                  <label class="block text-sm  text-gray-700 dark:text-gray-300 mb-1.5">{{ t('admin.ptkPendamping.labelKeterangan') }}</label>
                  <textarea v-model="form.keterangan" rows="2" @input="onFormChange"
                    :placeholder="t('admin.ptkPendamping.placeholderKeterangan')"
                    class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow placeholder:text-gray-400 dark:placeholder:text-gray-500"></textarea>
                </div>
              </template>

              <!-- Error -->
              <Transition name="fade">
                <div v-if="errorMsg" class="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ errorMsg }}</span>
                </div>
              </Transition>

              <!-- Actions -->
              <div class="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <button type="button" @click="handleCloseClick"
                  class="px-4 py-2 text-sm  text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors">
                  {{ t('common.batal') }}
                </button>
                <button type="submit" :disabled="saving"
                  class="px-5 py-2 text-sm  text-white bg-blue-600 rounded-md hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2">
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

      <!-- Modal Show Password -->
      <Transition name="modal">
        <div v-if="showPasswordModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="showPasswordModal = false"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm mx-auto p-4 border border-gray-300 dark:border-gray-600">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 class="text-lg  text-gray-900 dark:text-gray-100">{{ t('admin.guru.pwModalTitle') }}</h2>
            </div>

            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {{ t('admin.guru.pwModalMsg') }}
            </p>

            <div class="flex items-center gap-2 p-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg mb-4">
              <code class="flex-1 text-lg font-mono  text-center text-gray-900 dark:text-gray-100 tracking-wider select-all">
                {{ generatedPassword }}
              </code>
            </div>

            <div class="flex justify-end gap-3">
              <button @click="showPasswordModal = false"
                class="px-4 py-2 text-sm  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors">
                {{ t('admin.guru.tutup') }}
              </button>
              <button @click="copyPassword"
                class="px-4 py-2 text-sm  text-white bg-blue-600 rounded-md hover:bg-blue-700 active:bg-blue-800 inline-flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {{ t('admin.guru.salinPassword') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Modal Confirm Toggle Active -->
      <Transition name="modal">
        <div v-if="confirmToggle" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="confirmToggle = null"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm mx-auto p-4 border border-gray-300 dark:border-gray-600">
            <div class="flex items-center gap-3 mb-4">
              <div :class="confirmToggle.active ? 'p-2 bg-red-100 dark:bg-red-900/30 rounded-lg' : 'p-2 bg-green-100 dark:bg-green-900/30 rounded-lg'">
                <svg v-if="confirmToggle.active" class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <svg v-else class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg  text-gray-900 dark:text-gray-100">
                  {{ confirmToggle.active
                    ? (confirmToggle.jenis === 'PTK' ? t('admin.guru.toggleTitleNonaktif') : t('admin.ptkPendamping.nonaktifkanTitle'))
                    : (confirmToggle.jenis === 'PTK' ? t('admin.guru.toggleTitleAktif') : t('admin.ptkPendamping.aktifkanTitle')) }}
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ confirmToggle.nama }}</p>
              </div>
            </div>

            <p v-if="confirmToggle.active" class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {{ confirmToggle.jenis === 'PTK'
                ? t('admin.guru.toggleMsgNonaktif')
                : t('admin.ptkPendamping.toggleNonaktifMsg', { nama: confirmToggle.nama }) }}
            </p>
            <p v-else class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {{ confirmToggle.jenis === 'PTK'
                ? t('admin.guru.toggleMsgAktif')
                : t('admin.ptkPendamping.toggleAktifMsg', { nama: confirmToggle.nama }) }}
            </p>

            <div class="flex justify-end gap-3">
              <button @click="confirmToggle = null"
                class="px-4 py-2 text-sm  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors">
                {{ t('common.batal') }}
              </button>
              <button @click="handleToggleActive"
                :class="confirmToggle.active
                  ? 'px-4 py-2 text-sm  text-white bg-red-600 rounded-md hover:bg-red-700'
                  : 'px-4 py-2 text-sm  text-white bg-green-600 rounded-md hover:bg-green-700'">
                {{ confirmToggle.active ? t('admin.guru.yaNonaktifkan') : t('common.yaAktifkan') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Modal Confirm Delete Pendamping -->
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
                <h2 class="text-lg  text-gray-900 dark:text-gray-100">{{ t('admin.ptkPendamping.confirmDeleteTitle') }}</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ confirmDelete.nama }}</p>
              </div>
            </div>

            <p class="text-sm text-gray-600 dark:text-gray-400 mb-5">
              {{ t('admin.ptkPendamping.confirmDeleteMsg', { nama: confirmDelete.nama }) }}
            </p>

            <div class="flex justify-end gap-3">
              <button @click="confirmDelete = null"
                class="px-4 py-2 text-sm  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors">
                {{ t('common.batal') }}
              </button>
              <button @click="handleDelete" :disabled="saving"
                class="px-4 py-2 text-sm  text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50">
                {{ t('common.yaHapus') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Modal Confirm Reset Password -->
      <Transition name="modal">
        <div v-if="resetPasswordFor" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="resetPasswordFor = null"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm mx-auto p-4 border border-gray-300 dark:border-gray-600">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg  text-gray-900 dark:text-gray-100">{{ t('admin.guru.resetTitle') }}</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ resetPasswordFor.nama }}</p>
              </div>
            </div>

            <p class="text-sm text-gray-600 dark:text-gray-400 mb-5">
              {{ t('admin.guru.resetMsg') }}
            </p>

            <div class="flex justify-end gap-3">
              <button @click="resetPasswordFor = null"
                class="px-4 py-2 text-sm  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors">
                {{ t('common.batal') }}
              </button>
              <button @click="handleResetPassword"
                class="px-4 py-2 text-sm  text-white bg-amber-600 rounded-md hover:bg-amber-700 active:bg-amber-800">
                {{ t('admin.guru.yaReset') }}
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
