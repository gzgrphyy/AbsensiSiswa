<script setup lang="ts">
import { jenisIzinLabels, statusIzinLabels, statusIzinBadgeVariant } from '~/utils/absensi'

interface IzinOption {
  tanggal: string
  hari: string
}

interface IzinData {
  dates: IzinOption[]
  submitted: string[]
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

const { data: options, refresh: refreshOptions } = useFetch<IzinData>('/api/siswa/izin/options', { immediate: true })
const { data: riwayat, pending: pendingRiwayat, refresh: refreshRiwayat } = useFetch<RiwayatItem[]>('/api/siswa/izin', { immediate: true })

const form = ref<{ tanggal: string; jenis: string; keterangan: string; bukti: string | null }>({
  tanggal: '',
  jenis: 'IZIN',
  keterangan: '',
  bukti: null
})

const submitting = ref(false)
const uploading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const buktiInput = ref<HTMLInputElement>()

const eligibleDates = computed(() => options.value?.dates || [])
const submittedDates = computed(() => new Set(options.value?.submitted || []))

function isDisabledDate(tanggal: string) {
  return submittedDates.value.has(tanggal)
}

function dateLabel(tanggal: string) {
  const d = new Date(`${tanggal}T00:00:00`)
  const weekday = d.toLocaleDateString('id-ID', { weekday: 'short' })
  const day = d.getDate()
  const month = d.toLocaleDateString('id-ID', { month: 'short' })
  return { weekday, day, month }
}

function fullDateLabel(tanggal: string) {
  return new Date(`${tanggal}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
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
  if (!isDisabledDate(tanggal)) form.value.tanggal = tanggal
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
  if (!form.value.tanggal) {
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
    form.value.tanggal = ''
    form.value.keterangan = ''
    form.value.bukti = null
    await Promise.all([refreshOptions(), refreshRiwayat()])
    const available = eligibleDates.value.find(d => !isDisabledDate(d.tanggal))
    if (available) form.value.tanggal = available.tanggal
  } catch (err: any) {
    showError(err?.data?.statusMessage || 'Gagal mengirim pengajuan')
  } finally {
    submitting.value = false
  }
}

const formError = computed(() => {
  if (!form.value.tanggal) return 'Pilih tanggal pengajuan'
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
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Hanya untuk hari yang sesi kelasnya masih berjalan / belum selesai semua</p>
      </div>

      <div class="px-5 py-4 space-y-5">
        <!-- Tanggal -->
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Tanggal <span class="text-red-500">*</span>
          </label>

          <div v-if="eligibleDates.length === 0" class="rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
            Tidak ada hari yang bisa diajukan saat ini.
          </div>

          <div v-else class="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              v-for="opt in eligibleDates"
              :key="opt.tanggal"
              type="button"
              :disabled="isDisabledDate(opt.tanggal)"
              @click="pickTanggal(opt.tanggal)"
              class="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl border transition-colors"
              :class="isDisabledDate(opt.tanggal)
                ? 'border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/40 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : form.tanggal === opt.tanggal
                  ? 'border-primary-500 bg-primary-500 text-white shadow-md shadow-primary-500/30'
                  : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-700'"
            >
              <span class="text-[10px] font-semibold uppercase tracking-wide leading-none" :class="form.tanggal === opt.tanggal && !isDisabledDate(opt.tanggal) ? 'text-white/80' : ''">{{ dateLabel(opt.tanggal).weekday }}</span>
              <span class="text-lg font-bold leading-tight mt-0.5">{{ dateLabel(opt.tanggal).day }}</span>
              <span class="text-[9px] leading-none mt-0.5" :class="form.tanggal === opt.tanggal && !isDisabledDate(opt.tanggal) ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'">{{ dateLabel(opt.tanggal).month }}</span>
            </button>
          </div>

          <p v-if="form.tanggal" class="mt-2 text-xs text-primary-600 dark:text-primary-400 font-medium">{{ fullDateLabel(form.tanggal) }}</p>
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
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
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
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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

          <div v-if="!form.bukti" class="flex items-center gap-3">
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
            <span class="text-xs text-gray-400 dark:text-gray-500">PNG, JPG, WebP. Maks 10MB.</span>
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
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Kirim Pengajuan
        </button>
      </div>
    </div>

    <!-- Riwayat Pengajuan -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-card dark:shadow-dark-card overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
        <h2 class="text-sm font-bold text-gray-900 dark:text-gray-100">Riwayat Pengajuan</h2>
      </div>

      <LoadingSkeleton v-if="pendingRiwayat" type="table" :rows="3" :columns="3" />

      <div v-else-if="riwayat && riwayat.length === 0" class="px-5 py-10 text-center">
        <div class="w-12 h-12 rounded-full bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Belum ada pengajuan izin</p>
      </div>

      <div v-else class="divide-y divide-gray-100 dark:divide-slate-700">
        <div v-for="item in riwayat" :key="item.id" class="px-5 py-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {{ new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{{ item.keterangan }}</p>
            </div>
            <div class="flex flex-col items-end gap-1.5 flex-shrink-0">
              <div class="flex items-center gap-1.5">
                <BaseBadge :variant="item.jenis === 'SAKIT' ? 'amber' : 'blue'" size="sm">
                  {{ jenisIzinLabels[item.jenis] || item.jenis }}
                </BaseBadge>
                <BaseBadge :variant="statusIzinBadgeVariant[item.status] || 'gray'" size="sm">
                  {{ statusIzinLabels[item.status] || item.status }}
                </BaseBadge>
              </div>
              <span v-if="item.penanggap && item.status !== 'PENDING'" class="text-[10px] text-gray-400 dark:text-gray-500">
                oleh {{ item.penanggap }}
              </span>
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
    </div>
  </StudentLayout>
</template>