<script setup lang="ts">
import { z } from 'zod'

const { pengaturan, fetch: fetchPengaturan } = usePengaturan()
const activeTab = ref<'umum' | 'absensi' | 'keamanan'>('umum')

const formUmum = reactive({
  namaSekolah: 'SMK Negeri 1 Bandung',
  alamat: 'Jl. Merdeka No. 123, Bandung',
  telp: '022-1234567',
  email: 'info@smkn1bdg.sch.id',
  tahunAjaran: '2026/2027',
  semester: 'Ganjil',
  kepalaSekolah: 'Drs. H. Agus Salim, M.Pd.',
  nipKepsek: '196501011990011001',
})

const formBranding = reactive({
  namaAplikasi: 'Aplikasi Skoria',
  titelAplikasi: 'Sistem Absensi',
  iconPath: null as string | null,
  faviconPath: null as string | null,
})

// Preview state for branding images
const iconPreview = ref<string | null>(null)
const faviconPreview = ref<string | null>(null)
const iconFile = ref<File | null>(null)
const faviconFile = ref<File | null>(null)

const formAbsensi = reactive({
  batasScan: 10,
  autoTutupSesi: true,
  batasTelat: 15,
  notifikasi: true,
  toleransiAlpha: 3,
  izinTeksBebas: false,
})

const formKeamanan = reactive({
  minimalPassword: 8,
  sesiTimeout: 60,
  maxLogin: 3,
  twoFactorAuth: false,
  logAktivitas: true,
})

const saving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// Init branding from existing data
onMounted(() => {
  if (pengaturan.value) {
    formBranding.namaAplikasi = pengaturan.value.namaAplikasi
    formBranding.titelAplikasi = pengaturan.value.titelAplikasi
    formBranding.iconPath = pengaturan.value.iconPath
    formBranding.faviconPath = pengaturan.value.faviconPath
  }
})

// Watch for pengaturan changes (after save from other sources)
watch(pengaturan, (val) => {
  if (val) {
    formBranding.namaAplikasi = val.namaAplikasi
    formBranding.titelAplikasi = val.titelAplikasi
    formBranding.iconPath = val.iconPath
    formBranding.faviconPath = val.faviconPath
  }
})

async function uploadFile(file: File, type: string): Promise<string | null> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    const res = await $fetch<{ success: boolean; path: string }>('/api/admin/upload', {
      method: 'POST',
      body: formData,
    })
    return res.path
  } catch {
    return null
  }
}

function handleIconSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    iconFile.value = target.files[0]
    iconPreview.value = URL.createObjectURL(target.files[0])
  }
}

function handleFaviconSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    faviconFile.value = target.files[0]
    faviconPreview.value = URL.createObjectURL(target.files[0])
  }
}

function removeIcon() {
  iconPreview.value = null
  iconFile.value = null
  formBranding.iconPath = null
}

function removeFavicon() {
  faviconPreview.value = null
  faviconFile.value = null
  formBranding.faviconPath = null
}

async function handleSave() {
  saving.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    // Upload icon jika ada file baru
    if (iconFile.value) {
      const path = await uploadFile(iconFile.value, 'icon')
      if (path) formBranding.iconPath = path
    }

    // Upload favicon jika ada file baru
    if (faviconFile.value) {
      const path = await uploadFile(faviconFile.value, 'favicon')
      if (path) formBranding.faviconPath = path
    }

    await $fetch('/api/admin/pengaturan', {
      method: 'PUT',
      body: {
        umum: formUmum,
        branding: {
          namaAplikasi: formBranding.namaAplikasi,
          titelAplikasi: formBranding.titelAplikasi,
          iconPath: formBranding.iconPath,
          faviconPath: formBranding.faviconPath,
        },
        absensi: formAbsensi,
        keamanan: formKeamanan,
      },
    })

    // Refresh global state
    await fetchPengaturan()

    // Reset file inputs
    iconFile.value = null
    faviconFile.value = null
    iconPreview.value = null
    faviconPreview.value = null

    successMsg.value = 'Pengaturan berhasil disimpan'
  } catch {
    errorMsg.value = 'Gagal menyimpan pengaturan. Silakan coba lagi.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AppLayout>
    <PageHeader title="Pengaturan" description="Konfigurasi aplikasi absensi" />

    <Notification type="success" :message="successMsg" :show="!!successMsg" @dismiss="successMsg = ''" />
    <Notification type="error" :message="errorMsg" :show="!!errorMsg" @dismiss="errorMsg = ''" />

    <div class="flex gap-1 mb-5 bg-gray-100 dark:bg-gray-700 rounded-sm p-1">
      <button @click="activeTab = 'umum'"
        class="flex-1 py-2 px-4 text-sm font-medium rounded-sm transition-all"
        :class="activeTab === 'umum' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'">
        Umum
      </button>
      <button @click="activeTab = 'absensi'"
        class="flex-1 py-2 px-4 text-sm font-medium rounded-sm transition-all"
        :class="activeTab === 'absensi' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'">
        Absensi
      </button>
      <button @click="activeTab = 'keamanan'"
        class="flex-1 py-2 px-4 text-sm font-medium rounded-sm transition-all"
        :class="activeTab === 'keamanan' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'">
        Keamanan
      </button>
    </div>

    <BaseCard>
      <form @submit.prevent="handleSave">
        <!-- Umum -->
        <div v-show="activeTab === 'umum'" class="space-y-6">
          <!-- Branding Section -->
          <div>
            <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Branding & Visual
            </h3>
            <div class="bg-white dark:bg-gray-800 rounded-sm p-4 space-y-4 border border-gray-300 dark:border-gray-600">
              <!-- Nama Aplikasi & Titel -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseFormField label="Nama Aplikasi">
                  <input v-model="formBranding.namaAplikasi" type="text"
                    class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Aplikasi Skoria" />
                </BaseFormField>
                <BaseFormField label="Titel Aplikasi">
                  <input v-model="formBranding.titelAplikasi" type="text"
                    class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Sistem Absensi" />
                </BaseFormField>
              </div>

              <!-- Logo & Favicon side by side -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Logo Aplikasi (Icon) -->
                <div class="bg-white dark:bg-gray-800 rounded-sm border border-gray-300 dark:border-gray-600 p-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <span class="flex items-center gap-1.5">
                      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Logo Aplikasi
                    </span>
                  </label>
                  <!-- Preview -->
                  <div class="flex flex-col items-center gap-3">
                    <div class="w-24 h-24 rounded-sm border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700">
                      <img v-if="iconPreview || formBranding.iconPath"
                        :src="iconPreview || formBranding.iconPath"
                        class="w-full h-full object-contain p-2"
                        alt="Preview Logo" />
                      <svg v-else class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <!-- Upload controls -->
                    <div class="flex items-center gap-2">
                      <label class="relative cursor-pointer">
                        <input type="file" accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml" class="sr-only" @change="handleIconSelect" />
                        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-700 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Pilih File
                        </span>
                      </label>
                      <button v-if="formBranding.iconPath || iconPreview" type="button" @click="removeIcon"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-sm transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Hapus
                      </button>
                    </div>
                    <p class="text-[10px] text-gray-400 dark:text-gray-500 text-center">PNG, JPEG, SVG • Maks 2MB</p>
                  </div>
                </div>

                <!-- Favicon -->
                <div class="bg-white dark:bg-gray-800 rounded-sm border border-gray-300 dark:border-gray-600 p-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <span class="flex items-center gap-1.5">
                      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      Favicon
                    </span>
                  </label>
                  <!-- Preview -->
                  <div class="flex flex-col items-center gap-3">
                    <div class="w-16 h-16 rounded-sm border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700">
                      <img v-if="faviconPreview || formBranding.faviconPath"
                        :src="faviconPreview || formBranding.faviconPath"
                        class="w-full h-full object-contain p-1.5"
                        alt="Preview Favicon" />
                      <svg v-else class="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <!-- Upload controls -->
                    <div class="flex items-center gap-2">
                      <label class="relative cursor-pointer">
                        <input type="file" accept="image/png,image/jpeg,image/jpg,image/x-icon,image/vnd.microsoft.icon" class="sr-only" @change="handleFaviconSelect" />
                        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-700 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Pilih File
                        </span>
                      </label>
                      <button v-if="formBranding.faviconPath || faviconPreview" type="button" @click="removeFavicon"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-sm transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Hapus
                      </button>
                    </div>
                    <p class="text-[10px] text-gray-400 dark:text-gray-500 text-center">PNG, JPEG, ICO • Maks 2MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Separator -->
          <div class="border-t border-gray-200 dark:border-slate-700 pt-6">
            <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Informasi Sekolah</h3>
            <div class="space-y-4">
              <BaseFormField label="Nama Sekolah" required>
                <input v-model="formUmum.namaSekolah" type="text"
                  class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" />
              </BaseFormField>
              <BaseFormField label="Alamat">
                <textarea v-model="formUmum.alamat" rows="2"
                  class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"></textarea>
              </BaseFormField>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseFormField label="Telepon">
                  <input v-model="formUmum.telp" type="text"
                    class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" />
                </BaseFormField>
                <BaseFormField label="Email">
                  <input v-model="formUmum.email" type="email"
                    class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" />
                </BaseFormField>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseFormField label="Tahun Ajaran">
                  <input v-model="formUmum.tahunAjaran" type="text"
                    class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" />
                </BaseFormField>
                <BaseFormField label="Semester">
                  <select v-model="formUmum.semester"
                    class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700">
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </BaseFormField>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseFormField label="Kepala Sekolah">
                  <input v-model="formUmum.kepalaSekolah" type="text"
                    class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" />
                </BaseFormField>
                <BaseFormField label="NIP Kepala Sekolah">
                  <input v-model="formUmum.nipKepsek" type="text"
                    class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" />
                </BaseFormField>
              </div>
            </div>
          </div>
        </div>

        <!-- Absensi -->
        <div v-show="activeTab === 'absensi'" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseFormField label="Batas Scan (menit sebelum jam mulai)">
              <input v-model.number="formAbsensi.batasScan" type="number" min="1"
                class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" />
            </BaseFormField>
            <BaseFormField label="Batas Telat (menit)">
              <input v-model.number="formAbsensi.batasTelat" type="number" min="1"
                class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" />
            </BaseFormField>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseFormField label="Toleransi Alpha (kali)">
              <input v-model.number="formAbsensi.toleransiAlpha" type="number" min="1"
                class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" />
            </BaseFormField>
          </div>
          <div class="space-y-3">
            <BaseFormField label="Opsi Lainnya">
              <div class="flex items-center gap-3">
                <input v-model="formAbsensi.autoTutupSesi" type="checkbox" id="autoTutup"
                  class="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 dark:bg-slate-700 focus:ring-blue-500" />
                <label for="autoTutup" class="text-sm text-gray-700 dark:text-gray-300">Tutup sesi otomatis setelah jam selesai</label>
              </div>
              <div class="flex items-center gap-3">
                <input v-model="formAbsensi.notifikasi" type="checkbox" id="notif"
                  class="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 dark:bg-slate-700 focus:ring-blue-500" />
                <label for="notif" class="text-sm text-gray-700 dark:text-gray-300">Kirim notifikasi ke wali murid</label>
              </div>
              <div class="flex items-center gap-3">
                <input v-model="formAbsensi.izinTeksBebas" type="checkbox" id="izinBebas"
                  class="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 dark:bg-slate-700 focus:ring-blue-500" />
                <label for="izinBebas" class="text-sm text-gray-700 dark:text-gray-300">Izinkan teks bebas pada keterangan (selain sakit/izin)</label>
              </div>
            </BaseFormField>
          </div>
        </div>

        <!-- Keamanan -->
        <div v-show="activeTab === 'keamanan'" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseFormField label="Minimal Panjang Password">
              <input v-model.number="formKeamanan.minimalPassword" type="number" min="6"
                class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" />
            </BaseFormField>
            <BaseFormField label="Sesi Timeout (menit)">
              <input v-model.number="formKeamanan.sesiTimeout" type="number" min="5"
                class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" />
            </BaseFormField>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseFormField label="Max Login Gagal">
              <input v-model.number="formKeamanan.maxLogin" type="number" min="1"
                class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" />
            </BaseFormField>
          </div>
          <div class="space-y-3">
            <BaseFormField label="Opsi Keamanan">
              <div class="flex items-center gap-3">
                <input v-model="formKeamanan.twoFactorAuth" type="checkbox" id="2fa"
                  class="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 dark:bg-slate-700 focus:ring-blue-500" />
                <label for="2fa" class="text-sm text-gray-700 dark:text-gray-300">Aktifkan Two-Factor Authentication</label>
              </div>
              <div class="flex items-center gap-3">
                <input v-model="formKeamanan.logAktivitas" type="checkbox" id="log"
                  class="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 dark:bg-slate-700 focus:ring-blue-500" />
                <label for="log" class="text-sm text-gray-700 dark:text-gray-300">Catat log aktivitas pengguna</label>
              </div>
            </BaseFormField>
          </div>
        </div>

        <div class="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
          <button type="submit" :disabled="saving"
            class="px-6 py-2.5 bg-blue-600 text-sm font-medium text-white rounded-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {{ saving ? 'Menyimpan...' : 'Simpan Pengaturan' }}
          </button>
        </div>
      </form>
    </BaseCard>
  </AppLayout>
</template>
