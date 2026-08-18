<script setup lang="ts">
import { jenisIzinLabels, statusIzinLabels, statusIzinBadgeVariant } from '~/utils/absensi'

type IzinState = 'available' | 'submitted' | 'no_schedule' | 'finished'

interface IzinDay {
  tanggal: string
  hari: string
  state: IzinState
}

interface IzinData {
  days: IzinDay[]
  today: string
}

interface RiwayatItem {
  id: number
  tanggal: string
  jenis: string
  keterangan: string | null
  bukti: string | null
  status: string
  diresponPada: string | null
  penanggap: string | null
  createdAt: string
}

const MAX_TANGGAL = 14

const { data: options, refresh: refreshOptions } = useFetch<IzinData>('/api/siswa/izin/options', { immediate: true })
const { data: riwayat, pending: pendingRiwayat, refresh: refreshRiwayat } = useFetch<RiwayatItem[]>('/api/siswa/izin', { immediate: true })

const form = ref<{ tanggal: string[]; jenis: string; keterangan: string; bukti: string | null }>({
  tanggal: [],
  jenis: 'IZIN',
  keterangan: '',
  bukti: null
})

const submitting = ref(false)
const uploading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const buktiInput = ref<HTMLInputElement>()

const showCustomModal = ref(false)
const customDate = ref('')
const customDateMin = ref('')
const customDateMax = ref('')
const customMsg = ref('')
const addingCustom = ref(false)

const chipTooltip = ref<{ text: string; left: number; top: number } | null>(null)
let chipTooltipTimer: ReturnType<typeof setTimeout> | null = null

const disabledReasonMap: Record<string, string> = {
  submitted: 'Sudah diajukan',
  no_schedule: 'Tidak ada jadwal',
  finished: 'Sesi hari ini sudah selesai semua'
}

const days = computed(() => options.value?.days || [])
const stripDates = computed(() => new Set(days.value.map(d => d.tanggal)))
const customSelected = computed(() => form.value.tanggal.filter(t => !stripDates.value.has(t)))

function keyOf(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function stateOf(tanggal: string): IzinState | undefined {
  return days.value.find(d => d.tanggal === tanggal)?.state
}

function isDisabledDate(tanggal: string) {
  return stateOf(tanggal) !== 'available'
}

function disabledReason(tanggal: string) {
  const s = stateOf(tanggal)
  return s && s !== 'available' ? disabledReasonMap[s] || 'Tidak dapat dipilih' : ''
}

function dateLabel(tanggal: string) {
  const d = new Date(`${tanggal}T00:00:00`)
  const weekday = d.toLocaleDateString('id-ID', { weekday: 'short' })
  const day = d.getDate()
  const month = d.toLocaleDateString('id-ID', { month: 'short' })
  return { weekday, day, month }
}

function shortDateLabel(tanggal: string) {
  const d = new Date(`${tanggal}T00:00:00`)
  return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
}

function fullDateLabel(tanggal: string) {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(tanggal) ? new Date(`${tanggal}T00:00:00`) : new Date(tanggal)
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function waktuLabel(t: string | null) {
  if (!t) return ''
  return new Date(t).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function showError(msg: string) {
  errorMsg.value = msg
  setTimeout(() => { errorMsg.value = '' }, 5000)
}

function showSuccess(msg: string) {
  successMsg.value = msg
  setTimeout(() => { successMsg.value = '' }, 4000)
}

function pickJenis(jenis: string) {
  form.value.jenis = jenis
}

function pickTanggal(tanggal: string) {
  const idx = form.value.tanggal.indexOf(tanggal)
  if (idx >= 0) {
    form.value.tanggal.splice(idx, 1)
  } else {
    if (form.value.tanggal.length >= MAX_TANGGAL) {
      showError(`Maksimal ${MAX_TANGGAL} tanggal dalam satu pengajuan`)
      return
    }
    form.value.tanggal.push(tanggal)
  }
}

function clearAllTanggal() {
  form.value.tanggal = []
}

function onStripTap(tanggal: string, event: Event) {
  if (isDisabledDate(tanggal)) {
    showChipTooltip(tanggal, event)
    return
  }
  pickTanggal(tanggal)
}

function showChipTooltip(tanggal: string, event: Event) {
  const el = event.currentTarget as HTMLElement | null
  const rect = el?.getBoundingClientRect()
  const text = disabledReason(tanggal)
  if (!rect || !text) return
  const vw = window.innerWidth
  const left = Math.min(Math.max(rect.left + rect.width / 2, 80), vw - 80)
  chipTooltip.value = { text, left, top: rect.top }
  if (chipTooltipTimer) clearTimeout(chipTooltipTimer)
  chipTooltipTimer = setTimeout(() => { chipTooltip.value = null }, 2500)
}

function openCustomModal() {
  const now = new Date()
  customDateMin.value = keyOf(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))
  customDateMax.value = keyOf(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30))
  customDate.value = ''
  customMsg.value = ''
  showCustomModal.value = true
}

async function addCustomDate() {
  const t = customDate.value
  if (!t || addingCustom.value) return
  if (form.value.tanggal.includes(t)) {
    customMsg.value = 'Tanggal sudah dipilih'
    return
  }
  if (form.value.tanggal.length >= MAX_TANGGAL) {
    customMsg.value = `Maksimal ${MAX_TANGGAL} tanggal dalam satu pengajuan`
    return
  }
  addingCustom.value = true
  customMsg.value = ''
  try {
    const res = await $fetch<{ available: boolean; reason: string | null }>(`/api/siswa/izin/check?tanggal=${t}`)
    if (!res.available) {
      customMsg.value = res.reason || 'Tanggal tidak dapat dipilih'
      return
    }
    form.value.tanggal.push(t)
    customDate.value = ''
  } catch (err: any) {
    customMsg.value = err?.data?.statusMessage || 'Gagal memeriksa tanggal'
  } finally {
    addingCustom.value = false
  }
}

async function handleBuktiUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploading.value = true
  errorMsg.value = ''
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await $fetch<{ success: boolean; path: string }>('/api/user/upload', {
      method: 'POST',
      body: fd
    })
    if (res.success) {
      form.value.bukti = res.path
    }
  } catch (err: any) {
    showError(err?.data?.statusMessage || 'Upload bukti gagal')
  } finally {
    uploading.value = false
    input.value = ''
  }
}

function clearBukti() {
  form.value.bukti = null
}

async function submit() {
  if (form.value.tanggal.length === 0) {
    showError('Pilih tanggal terlebih dahulu')
    return
  }
  if (!form.value.jenis) {
    showError('Pilih jenis izin')
    return
  }
  if (!form.value.keterangan.trim()) {
    showError('Isi keterangan alasan izin')
    return
  }

  submitting.value = true
  errorMsg.value = ''
  try {
    await $fetch('/api/siswa/izin', {
      method: 'POST',
      body: {
        tanggal: form.value.tanggal,
        jenis: form.value.jenis,
        keterangan: form.value.keterangan.trim(),
        bukti: form.value.bukti || undefined
      }
    })
    showSuccess('Pengajuan izin berhasil dikirim. Menunggu persetujuan wali kelas.')
    form.value.tanggal = []
    form.value.keterangan = ''
    form.value.bukti = null
    await Promise.all([refreshOptions(), refreshRiwayat()])
    const available = days.value.find(d => d.state === 'available')
    if (available) form.value.tanggal = [available.tanggal]
  } catch (err: any) {
    showError(err?.data?.statusMessage || 'Gagal mengirim pengajuan')
  } finally {
    submitting.value = false
  }
}

const formError = computed(() => {
  if (form.value.tanggal.length === 0) return 'Pilih tanggal pengajuan'
  if (!form.value.jenis) return 'Pilih jenis izin'
  if (!form.value.keterangan.trim()) return 'Isi keterangan alasan izin'
  return ''
})
</script>

<template>
  <StudentLayout>
    <PageHeader title="Izin / Sakit" description="Pengajuan izin kehadiran" :show-back="false" />

    <Notification type="error" :message="errorMsg" :show="!!errorMsg" @dismiss="errorMsg = ''" />
    <Notification type="success" :message="successMsg" :show="!!successMsg" @dismiss="successMsg = ''" />

    <!-- Form Pengajuan -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-card dark:shadow-dark-card overflow-hidden mb-5">
      <div class="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
        <h2 class="text-sm font-bold text-gray-900 dark:text-gray-100">Ajukan Izin / Sakit</h2>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Bisa pilih beberapa hari sekaligus. Hanya untuk hari yang sesi kelasnya masih berjalan / belum selesai semua</p>
      </div>

      <div class="px-5 py-4 space-y-5">
        <!-- Tanggal -->
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Tanggal <span class="text-red-500">*</span>
          </label>

          <div v-if="days.length === 0" class="rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
            Tidak ada hari yang bisa diajukan saat ini.
          </div>

          <div v-else class="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              v-for="opt in days"
              :key="opt.tanggal"
              type="button"
              :aria-disabled="isDisabledDate(opt.tanggal)"
              @click="onStripTap(opt.tanggal, $event)"
              class="relative flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl border transition-colors"
              :class="isDisabledDate(opt.tanggal)
                ? 'border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/40 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : form.tanggal.includes(opt.tanggal)
                  ? 'bg-primary-500 border-primary-600 text-white shadow-md shadow-primary-500/30'
                  : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-700'"
            >
              <span class="text-[10px] font-semibold uppercase tracking-wide leading-none">{{ dateLabel(opt.tanggal).weekday }}</span>
              <span class="text-lg font-bold leading-tight mt-0.5">{{ dateLabel(opt.tanggal).day }}</span>
              <span class="text-[9px] leading-none mt-0.5" :class="form.tanggal.includes(opt.tanggal) && !isDisabledDate(opt.tanggal) ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'">{{ dateLabel(opt.tanggal).month }}</span>

              <span
                v-if="form.tanggal.includes(opt.tanggal) && !isDisabledDate(opt.tanggal)"
                class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-primary-600 border border-primary-400 shadow-sm flex items-center justify-center"
              >
                <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3.5" d="M5 13l4 4L19 7" />
                </svg>
              </span>

              <span
                v-if="isDisabledDate(opt.tanggal)"
                class="absolute top-1 right-1 text-gray-300 dark:text-gray-600"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 8V7a5 5 0 0 0-10 0v1a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3Zm-9-1a4 4 0 0 1 8 0v1H8V7Zm8 14H8a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z" />
                </svg>
              </span>
            </button>
          </div>

          <!-- Tooltip chip disabled -->
          <div
            v-if="chipTooltip"
            class="fixed z-50 pointer-events-none"
            :style="{ left: chipTooltip.left + 'px', top: chipTooltip.top + 'px' }"
          >
            <div class="-translate-x-1/2 -translate-y-full pb-1.5">
              <div class="relative bg-gray-900 dark:bg-slate-950 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap">
                {{ chipTooltip.text }}
                <span class="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-gray-900 dark:bg-slate-950 -mt-1 rotate-45" />
              </div>
            </div>
          </div>

          <!-- Pilih tanggal lain -->
          <button
            type="button"
            @click="openCustomModal"
            class="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Pilih tanggal lain
          </button>

          <!-- Ringkasan chip -->
          <div v-if="form.tanggal.length" class="mt-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50/70 dark:bg-slate-700/30 px-3 py-2.5">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-semibold text-gray-600 dark:text-gray-400">Terpilih ({{ form.tanggal.length }})</p>
              <button
                type="button"
                @click="clearAllTanggal"
                class="text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                Hapus semua
              </button>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="t in form.tanggal"
                :key="t"
                class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-medium shadow-sm"
              >
                <svg class="w-3 h-3 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
                {{ shortDateLabel(t) }}
                <button
                  type="button"
                  @click="pickTanggal(t)"
                  class="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                  title="Hapus tanggal"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
          </div>
        </div>

        <!-- Jenis -->
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Jenis <span class="text-red-500">*</span>
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="pickJenis('SAKIT')"
              class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors"
              :class="form.jenis === 'SAKIT'
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500'
                : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:border-amber-300 dark:hover:border-amber-700'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path d="M17 3l4 4" />
                <path d="M19 5l-4.5 4.5" />
                <path d="M11.5 6.5l6 6" />
                <path d="M16.5 11.5l-6.5 6.5h-4v-4l6.5 -6.5" />
                <path d="M7.5 12.5l1.5 1.5" />
                <path d="M10.5 9.5l1.5 1.5" />
                <path d="M3 21l3 -3" />
              </svg>
              Sakit
            </button>
            <button
              type="button"
              @click="pickJenis('IZIN')"
              class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors"
              :class="form.jenis === 'IZIN'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-700'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path d="M9 5h9a2 2 0 0 1 2 2v9m-.184 3.839a2 2 0 0 1 -1.816 1.161h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 1.158 -1.815" />
                <path d="M16 3v4" />
                <path d="M8 3v1" />
                <path d="M4 11h7m4 0h5" />
                <path d="M3 3l18 18" />
              </svg>
              Izin
            </button>
          </div>
        </div>

        <!-- Keterangan -->
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Keterangan <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="form.keterangan"
            rows="3"
            maxlength="255"
            placeholder="Tulis alasan izin / sakit..."
            class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow resize-none"
          ></textarea>
          <p class="mt-1 text-right text-xs text-gray-400 dark:text-gray-500">{{ form.keterangan.length }}/255</p>
        </div>

        <!-- Bukti (opsional) -->
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Bukti <span class="text-gray-400 dark:text-gray-500 font-normal">(opsional — surat / foto)</span>
          </label>

          <div v-if="!form.bukti">
            <input ref="buktiInput" type="file" accept="image/*" class="hidden" @change="handleBuktiUpload" />
            <button
              type="button"
              :disabled="uploading"
              @click="buktiInput?.click()"
              class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition-colors disabled:opacity-50"
            >
              <svg v-if="uploading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {{ uploading ? 'Mengunggah...' : 'Unggah Bukti' }}
            </button>
            <p class="mt-1.5 text-xs text-gray-400 dark:text-gray-500">PNG, JPG, WebP. Maks 10MB.</p>
          </div>

          <div v-else class="flex items-center gap-3">
            <a :href="form.bukti" target="_blank" rel="noopener" class="block w-14 h-14 rounded-xl border border-gray-200 dark:border-slate-600 overflow-hidden flex-shrink-0">
              <img :src="form.bukti" alt="Pratinjau bukti" class="w-full h-full object-cover" />
            </a>
            <span class="text-sm text-gray-500 dark:text-gray-400 truncate flex-1">{{ form.bukti.split('/').pop() }}</span>
            <button
              type="button"
              @click="clearBukti"
              class="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="Hapus bukti"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <button
          type="button"
          :disabled="submitting || !!formError"
          @click="submit"
          class="w-full px-4 py-3 text-sm font-semibold text-white bg-primary-500 rounded-xl hover:bg-primary-600 active:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-primary-500/30 inline-flex items-center justify-center gap-2"
        >
          <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Kirim Pengajuan
        </button>
      </div>
    </div>

    <!-- Modal Pilih Tanggal Lain -->
    <BaseModal :show="showCustomModal" title="Pilih Tanggal Lain" max-w="max-w-sm" @close="showCustomModal = false">
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Pilih tanggal di luar minggu berjalan, misalnya untuk izin / sakit lanjutan beberapa hari ke depan.</p>
      <input
        v-model="customDate"
        type="date"
        :min="customDateMin"
        :max="customDateMax"
        class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
      />
      <p v-if="customMsg" class="mt-2 text-xs text-red-500">{{ customMsg }}</p>
      <button
        type="button"
        :disabled="addingCustom || !customDate"
        @click="addCustomDate"
        class="mt-3 w-full px-4 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-xl hover:bg-primary-600 active:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-primary-500/30 inline-flex items-center justify-center gap-2"
      >
        <svg v-if="addingCustom" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Tambahkan Tanggal
      </button>

      <div v-if="customSelected.length" class="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
        <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Ditambahkan di luar minggu ({{ customSelected.length }})</p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="t in customSelected"
            :key="t"
            class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs font-medium"
          >
            {{ shortDateLabel(t) }}
            <button
              type="button"
              @click="pickTanggal(t)"
              class="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
              title="Hapus tanggal"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        </div>
      </div>
    </BaseModal>

    <!-- Riwayat Pengajuan -->
    <section>
      <h2 class="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-3">Riwayat Pengajuan</h2>

      <LoadingSkeleton v-if="pendingRiwayat" type="table" :rows="3" :columns="3" />

      <div v-else-if="riwayat && riwayat.length === 0" class="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card dark:shadow-dark-card px-5 py-8 text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Belum ada pengajuan izin</p>
      </div>

      <div v-else class="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card dark:shadow-dark-card overflow-hidden divide-y divide-gray-100 dark:divide-slate-700">
        <div v-for="item in riwayat" :key="item.id" class="px-5 py-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{{ fullDateLabel(item.tanggal) }}</p>
              <p v-if="item.keterangan" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{{ item.keterangan }}</p>
              <p v-if="item.penanggap && item.diresponPada" class="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">
                Diproses oleh {{ item.penanggap }} · {{ waktuLabel(item.diresponPada) }}
              </p>
            </div>
            <div class="flex items-center gap-1.5 flex-shrink-0">
              <BaseBadge variant="gray" size="sm">
                {{ jenisIzinLabels[item.jenis] || item.jenis }}
              </BaseBadge>
              <BaseBadge :variant="statusIzinBadgeVariant[item.status] || 'gray'" size="sm">
                {{ statusIzinLabels[item.status] || item.status }}
              </BaseBadge>
            </div>
          </div>
          <div v-if="item.bukti" class="mt-3">
            <a :href="item.bukti" target="_blank" rel="noopener" class="inline-flex items-center gap-2 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Lihat Bukti
            </a>
          </div>
        </div>
      </div>
    </section>
  </StudentLayout>
</template>
