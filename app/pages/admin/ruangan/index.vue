<script setup lang="ts">
interface Ruangan {
  id: number
  nama: string
  jenis: string
  qrCode: string
  sesiAktif: boolean
  jumlahSesiAktif: number
  createdAt: string
  _count: { jadwalPelajaran: number }
}

const { t } = useI18n()

const jenisOptions = ['KELAS', 'LAB', 'PERPUSTAKAAN', 'AULA', 'LAINNYA']

function jenisLabel(jenis: string) {
  return t(`admin.ruangan.jenis.${jenis}`)
}

const { data, pending, refresh } = useFetch<Ruangan[]>('/api/admin/ruangan', { immediate: true })
const searchQuery = ref('')
const filterJenis = ref('')

// Auto-refresh tiap 15 detik agar status sesi selalu ter-update
onMounted(() => {
  const interval = setInterval(() => refresh(), 15000)
  onUnmounted(() => clearInterval(interval))
})

const filteredData = computed(() => {
  if (!data.value) return []
  let result = data.value
  if (filterJenis.value) {
    result = result.filter(r => r.jenis === filterJenis.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r => r.nama.toLowerCase().includes(q) || r.qrCode.toLowerCase().includes(q))
  }
  return result
})

const page = ref(1)
const pageSize = 5

watch([searchQuery, filterJenis], () => { page.value = 1 })

const totalPages = computed(() => Math.max(1, Math.ceil(filteredData.value.length / pageSize)))
const visibleData = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredData.value.slice(start, start + pageSize)
})

const showModal = ref(false)
const editing = ref<Ruangan | null>(null)
const form = ref({ nama: '', jenis: 'KELAS' })
const saving = ref(false)
const confirmDelete = ref<Ruangan | null>(null)
const showQR = ref<Ruangan | null>(null)
const qrSvg = ref('')
const loadingQR = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const confirmClose = ref(false)
const dirtyForm = ref(false)
const copiedType = ref<'code' | 'url' | null>(null)

const scanUrl = computed(() => {
  if (!showQR.value) return ''
  if (!import.meta.client) return `${showQR.value.qrCode}`
  return `${window.location.origin}/siswa/scan?code=${showQR.value.qrCode}`
})

async function copyToClipboard(text: string, type: 'code' | 'url') {
  try {
    await navigator.clipboard.writeText(text)
    copiedType.value = type
    setTimeout(() => { copiedType.value = null }, 2000)
  } catch {
    // fallback
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copiedType.value = type
    setTimeout(() => { copiedType.value = null }, 2000)
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

function openCreate() {
  editing.value = null
  form.value = { nama: '', jenis: 'KELAS' }
  showModal.value = true
}

function openEdit(item: Ruangan) {
  editing.value = item
  form.value = { nama: item.nama, jenis: item.jenis }
  showModal.value = true
}

function onFormChange() { dirtyForm.value = true }

function handleCloseClick() {
  if (dirtyForm.value) { confirmClose.value = true }
  else { showModal.value = false }
}

async function handleSave() {
  saving.value = true
  errorMsg.value = ''
  try {
    if (editing.value) {
      const body: Record<string, unknown> = {}
      if (form.value.nama !== editing.value.nama) body.nama = form.value.nama
      if (form.value.jenis !== editing.value.jenis) body.jenis = form.value.jenis
      if (Object.keys(body).length === 0) { showModal.value = false; return }
      const { error } = await useFetch(`/api/admin/ruangan/${editing.value.id}`, { method: 'PATCH', body })
      if (error.value) { showError(error.value.statusMessage || t('admin.ruangan.msgGagalSimpan')); return }
      showSuccess(t('admin.ruangan.msgBerhasilEdit'))
    } else {
      const { error } = await useFetch('/api/admin/ruangan', { method: 'POST', body: form.value })
      if (error.value) { showError(error.value.statusMessage || t('admin.ruangan.msgGagalSimpan')); return }
      showSuccess(t('admin.ruangan.msgBerhasilTambah'))
    }
    showModal.value = false
    confirmClose.value = false
    await refresh()
  } finally { saving.value = false }
}

async function handleDelete() {
  if (!confirmDelete.value) return
  const { id } = confirmDelete.value
  confirmDelete.value = null
  const { error } = await useFetch(`/api/admin/ruangan/${id}`, { method: 'DELETE' })
  if (error.value) { showError(error.value.statusMessage || t('admin.ruangan.msgGagalHapus')); return }
  showSuccess(t('admin.ruangan.msgBerhasilHapus'))
  await refresh()
}

async function openQR(item: Ruangan) {
  showQR.value = item
  loadingQR.value = true
  qrSvg.value = ''
  try {
    const res = await $fetch(`/api/admin/ruangan/${item.id}/qr.svg`, { responseType: 'text' })
    qrSvg.value = res as string
  } catch {
    showError(t('admin.ruangan.msgGagalQr'))
  } finally { loadingQR.value = false }
}

function printQR() {
  if (!showQR.value) return
  const printWin = window.open('', '_blank')
  if (!printWin) return
  printWin.document.write(`
    <!DOCTYPE html><html><head><title>QR - ${showQR.value.nama}</title>
    <style>body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;font-family:sans-serif}
    .container{text-align:center}
    h2{margin-bottom:8px;color:#1e293b}
    p{color:#64748b;margin-top:4px}
    svg{max-width:400px;width:100%;height:auto}</style></head>
    <body><div class="container"><h2>${showQR.value.nama}</h2>
    <p>${t('admin.ruangan.qr.scan')}</p>${qrSvg.value}</div></body></html>
  `)
  printWin.document.close()
  printWin.print()
}

function ruanganUrl(item: Ruangan) {
  if (!import.meta.client) return ''
  return `${window.location.origin}/siswa/scan?code=${item.qrCode}`
}
</script>

<template>
  <AppLayout>
    <PageHeader :title="t('admin.ruangan.title')" :description="t('admin.ruangan.desc')" />

    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="searchQuery" type="text" :placeholder="t('admin.ruangan.searchPlaceholder')"
            class="w-40 sm:w-56 pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400" />
        </div>
        <select v-model="filterJenis"
          class="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">{{ t('admin.ruangan.semuaJenis') }}</option>
          <option v-for="j in jenisOptions" :key="j" :value="j">{{ jenisLabel(j) }}</option>
        </select>
      </div>
      <button @click="openCreate"
        class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm ">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span class="hidden sm:inline">{{ t('admin.ruangan.tambahRuangan') }}</span>
      </button>
    </div>

    <Notification type="error" :message="errorMsg" :show="!!errorMsg" @dismiss="errorMsg = ''" />
    <Notification type="success" :message="successMsg" :show="!!successMsg" @dismiss="successMsg = ''" />

      <div v-if="pending" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
        <div class="p-6 space-y-4">
          <div v-for="i in 3" :key="i" class="flex items-center gap-4 animate-pulse">
            <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-40"></div>
            <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20 ml-auto"></div>
            <div class="h-6 bg-gray-200 dark:bg-slate-700 rounded w-24 ml-auto"></div>
          </div>
        </div>
      </div>

      <div v-else class="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
                <th class="text-left px-4 sm:px-6 py-3.5  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.ruangan.colRuangan') }}</th>
                <th class="text-center px-4 sm:px-6 py-3.5  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden sm:table-cell">{{ t('admin.ruangan.colJenis') }}</th>
                <th class="text-center px-4 sm:px-6 py-3.5  text-gray-600 dark:text-gray-300 text-xs tracking-wider hidden sm:table-cell">{{ t('admin.ruangan.colJadwal') }}</th>
                <th class="text-center px-4 sm:px-6 py-3.5  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.ruangan.colStatusSesi') }}</th>
                <th class="text-center px-4 sm:px-6 py-3.5  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.ruangan.colQr') }}</th>
                <th class="text-center px-4 sm:px-6 py-3.5  text-gray-600 dark:text-gray-300 text-xs tracking-wider">{{ t('admin.tahunAjaran.colAksi') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
              <tr v-for="item in visibleData" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <td class="px-4 sm:px-6 py-4">
                  <span class=" text-gray-900 dark:text-gray-100">{{ item.nama }}</span>
                </td>
                <td class="px-4 sm:px-6 py-4 text-center hidden sm:table-cell">
                  <BaseBadge :variant="item.jenis === 'KELAS' ? 'blue' : item.jenis === 'LAB' ? 'purple' : item.jenis === 'PERPUSTAKAAN' ? 'amber' : 'gray'" size="sm">{{ jenisLabel(item.jenis) }}</BaseBadge>
                </td>
                <td class="px-4 sm:px-6 py-4 text-center hidden sm:table-cell">
                  <span class="text-gray-600 dark:text-gray-300 ">{{ item._count.jadwalPelajaran }}</span>
                </td>
                <td class="px-4 sm:px-6 py-4 text-center">
                  <BaseBadge :variant="item.sesiAktif ? 'green' : 'gray'" size="sm" :dot="item.sesiAktif" :pulse="item.sesiAktif">
                    {{ item.sesiAktif ? t('admin.ruangan.sesiAktif') : t('admin.ruangan.sesiTidakAda') }}
                  </BaseBadge>
                </td>
                <td class="px-4 sm:px-6 py-4 text-center">
                  <button @click="openQR(item)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-sm  text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    QR
                  </button>
                </td>
                <td class="px-4 sm:px-6 py-4">
                  <div class="flex items-center justify-center gap-1">
                    <button @click="openEdit(item)" class="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" :title="t('common.edit')">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button @click="confirmDelete = item" class="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md" :title="t('common.hapus')">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!filteredData || filteredData.length === 0">
                <td colspan="6" class="px-4 sm:px-6 py-16 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <svg class="w-12 h-12 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p class="text-gray-500 dark:text-gray-400 ">{{ t('admin.ruangan.empty') }}</p>
                    <button @click="openCreate" class="inline-flex items-center gap-1 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                      {{ t('admin.ruangan.emptyAction') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="filteredData.length > pageSize" class="px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <p class="text-xs text-gray-400 dark:text-gray-500">
            {{ t('common.menampilkan', { from: ((page - 1) * pageSize) + 1, to: Math.min(page * pageSize, filteredData.length), total: filteredData.length, unit: t('admin.ruangan.unitRuangan') }) }}
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
              <h2 class="text-lg  text-gray-900 dark:text-gray-100">{{ editing ? t('admin.ruangan.modalEdit') : t('admin.ruangan.modalCreate') }}</h2>
              <button @click="handleCloseClick" class="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form @submit.prevent="handleSave" class="p-4 space-y-4">
              <div>
                <label class="block text-sm  text-gray-700 dark:text-gray-300 mb-1.5">{{ t('admin.ruangan.labelNama') }}</label>
                <input v-model="form.nama" type="text" @input="onFormChange" :placeholder="t('admin.ruangan.placeholderNama')"
                  class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
              </div>
              <div>
                <label class="block text-sm  text-gray-700 dark:text-gray-300 mb-1.5">{{ t('admin.ruangan.labelJenis') }}</label>
                <select v-model="form.jenis" @change="onFormChange"
                  class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700">
                  <option v-for="j in jenisOptions" :key="j" :value="j">{{ jenisLabel(j) }}</option>
                </select>
              </div>
              <Transition name="fade">
                <div v-if="!editing" class="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ t('admin.ruangan.infoQr') }}</span>
                </div>
              </Transition>
              <Transition name="fade">
                <div v-if="errorMsg" class="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                  <span>{{ errorMsg }}</span>
                </div>
              </Transition>
              <div class="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-slate-700">
                <button type="button" @click="handleCloseClick" class="px-4 py-2 text-sm  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">{{ t('common.batal') }}</button>
                <button type="submit" :disabled="saving"
                  class="px-5 py-2 text-sm  text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2">
                  <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  {{ saving ? t('common.menyimpan') : t('common.simpan') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>

      <!-- Modal QR Code -->
      <Transition name="modal">
        <div v-if="showQR" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click="showQR = null">
          <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="showQR = null"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm mx-auto p-4 border border-gray-300 dark:border-gray-600 text-center">
            <button @click="showQR = null" class="absolute top-3 right-3 p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <h2 class="text-lg  text-gray-900 dark:text-gray-100 mb-1">{{ showQR.nama }}</h2>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">{{ t('admin.ruangan.qr.scan') }}</p>

            <div v-if="loadingQR" class="py-12 flex justify-center">
              <svg class="w-8 h-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            </div>
            <div v-else-if="qrSvg" class="flex justify-center mb-4" v-html="qrSvg"></div>

            <!-- Kode QR Text -->
            <div v-if="!loadingQR && showQR" class="mb-4 text-left">
              <div class="bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 p-3 space-y-2">
                <div>
                  <label class="text-xs  text-gray-500 dark:text-gray-400 tracking-wider">{{ t('admin.ruangan.qr.labelKode') }}</label>
                  <div class="flex items-center gap-2 mt-1">
                    <code class="flex-1 text-sm font-mono text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded px-2 py-1.5 truncate">{{ showQR.qrCode }}</code>
                    <button @click="copyToClipboard(showQR.qrCode, 'code')"
                      class="flex-shrink-0 p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                      :title="copiedType === 'code' ? t('admin.ruangan.qr.tersalin') : t('admin.ruangan.qr.salinKode')">
                      <svg v-if="copiedType !== 'code'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <svg v-else class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label class="text-xs  text-gray-500 tracking-wider">{{ t('admin.ruangan.qr.labelUrl') }}</label>
                  <div class="flex items-center gap-2 mt-1">
                    <code class="flex-1 text-xs font-mono text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded px-2 py-1.5 truncate">{{ scanUrl }}</code>
                    <button @click="copyToClipboard(scanUrl, 'url')"
                      class="flex-shrink-0 p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                      :title="copiedType === 'url' ? t('admin.ruangan.qr.tersalin') : t('admin.ruangan.qr.salinUrl')">
                      <svg v-if="copiedType !== 'url'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <svg v-else class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                  <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ t('admin.ruangan.qr.infoScan') }}</p>
                </div>
              </div>
            </div>

            <div class="flex gap-2 justify-center">
              <button @click="printQR" class="px-4 py-2 text-sm  text-white bg-blue-600 rounded-md hover:bg-blue-700 inline-flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                {{ t('admin.ruangan.qr.cetak') }}
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
            <h2 class="text-lg  text-gray-900 dark:text-gray-100 mb-2">{{ t('admin.ruangan.confirmDeleteTitle') }}</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ t('admin.ruangan.confirmDeleteMsg', { nama: confirmDelete.nama }) }}</p>
            <p v-if="confirmDelete._count.jadwalPelajaran > 0" class="mt-3 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-300">
              {{ t('admin.ruangan.confirmDeleteJadwal', { count: confirmDelete._count.jadwalPelajaran }) }}
            </p>
            <div class="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-slate-700">
              <button @click="confirmDelete = null" class="px-4 py-2 text-sm  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">{{ t('common.batal') }}</button>
              <button @click="handleDelete" class="px-4 py-2 text-sm  text-white bg-red-600 rounded-md hover:bg-red-700">{{ t('common.yaHapus') }}</button>
            </div>
          </div>
        </div>
      </Transition>

      </Teleport>
  </AppLayout>
</template>

<style scoped>
.modal-enter-active { transition: all 0.2s ease-out; }
.modal-leave-active { transition: all 0.15s ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > div:last-child, .modal-leave-to > div:last-child { transform: scale(0.95); }
.slide-enter-active { transition: all 0.3s ease-out; }
.slide-leave-active { transition: all 0.2s ease-in; }
.slide-enter-from { transform: translateY(-10px); opacity: 0; }
.slide-leave-to { transform: translateY(-10px); opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
