<script setup lang="ts">
interface ProfileData {
  id: number
  nama: string
  nip: string | null
  foto: string | null
  email: string
  role: string
  nisn?: string
  namaSiswa?: string
  kelas?: { id: number; nama: string }
  waliKelas?: { id: number; nama: string } | null
  namaWali?: string | null
  kontakWali?: string | null
  ptkPendamping?: { id: number; nama: string }[]
}

const { data: profile, refresh } = useFetch<ProfileData>('/api/user/profile', { immediate: true })

const form = reactive({
  nama: '',
  email: '',
  namaWali: '',
  kontakWali: '',
  foto: null as string | null
})

const pwForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const errorMsg = ref('')
const successMsg = ref('')
const saving = ref(false)
const fotoFile = ref<File | null>(null)
const fotoPreview = ref<string | null>(null)
const fotoUploading = ref(false)
const showEditModal = ref(false)

const pwErrorMsg = ref('')
const pwSuccessMsg = ref('')
const savingPw = ref(false)

watch(profile, (val) => {
  if (val) {
    form.nama = val.namaSiswa || val.nama || ''
    form.email = val.email || ''
    form.namaWali = val.namaWali || ''
    form.kontakWali = val.kontakWali || ''
    form.foto = val.foto
  }
}, { immediate: true })



function openEditModal() {
  errorMsg.value = ''
  successMsg.value = ''
  fotoPreview.value = null
  fotoFile.value = null
  showEditModal.value = true
}

function closeEditModal() {
  if (saving.value) return
  showEditModal.value = false
}

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await $fetch<{ success: boolean; path: string }>('/api/user/upload', {
    method: 'POST',
    body: formData,
  })
  return res.path
}

function handleFotoSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    errorMsg.value = ''
    if (file.size > 10 * 1024 * 1024) {
      errorMsg.value = 'Foto: File terlalu besar. Maksimal 10MB'
      target.value = ''
      return
    }
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'].includes(file.type)) {
      errorMsg.value = 'Foto: Tipe file tidak didukung'
      target.value = ''
      return
    }
    fotoFile.value = file
    fotoPreview.value = URL.createObjectURL(file)
  }
}

function removeFoto() {
  fotoPreview.value = null
  fotoFile.value = null
  form.foto = null
}

async function handleSave() {
  saving.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    if (fotoFile.value) {
      fotoUploading.value = true
      const foto = await uploadFile(fotoFile.value)
      form.foto = foto
      fotoUploading.value = false
    }

    const body: Record<string, any> = {}
    if (form.nama) body.nama = form.nama
    if (form.email && form.email !== profile.value?.email) body.email = form.email
    if (form.namaWali !== undefined) body.namaWali = form.namaWali || null
    if (form.kontakWali !== undefined) body.kontakWali = form.kontakWali || null
    if (form.foto !== undefined) body.foto = form.foto

    await $fetch('/api/user/profile', { method: 'PUT', body })
    successMsg.value = 'Profil berhasil diperbarui'
    showEditModal.value = false
    await refresh()
  } catch (err: any) {
    fotoUploading.value = false
    errorMsg.value = err?.data?.statusMessage || 'Gagal menyimpan profil'
  } finally {
    saving.value = false
  }
}

async function handleChangePassword() {
  pwErrorMsg.value = ''
  pwSuccessMsg.value = ''

  if (!pwForm.currentPassword) {
    pwErrorMsg.value = 'Password saat ini wajib diisi'
    return
  }
  if (!pwForm.newPassword) {
    pwErrorMsg.value = 'Password baru wajib diisi'
    return
  }
  if (pwForm.newPassword.length < 6) {
    pwErrorMsg.value = 'Password baru minimal 6 karakter'
    return
  }
  if (pwForm.newPassword !== pwForm.confirmPassword) {
    pwErrorMsg.value = 'Konfirmasi password tidak cocok'
    return
  }

  savingPw.value = true
  try {
    await $fetch('/api/user/password', {
      method: 'PUT',
      body: {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      }
    })
    pwSuccessMsg.value = 'Password berhasil diubah'
    pwForm.currentPassword = ''
    pwForm.newPassword = ''
    pwForm.confirmPassword = ''
  } catch (err: any) {
    pwErrorMsg.value = err?.data?.statusMessage || 'Gagal mengubah password'
  } finally {
    savingPw.value = false
  }
}
</script>

<template>
  <StudentLayout>
    <PageHeader title="Profil Saya" description="Informasi akun murid" :show-back="false" />

    <Notification type="success" :message="successMsg" :show="!!successMsg" @dismiss="successMsg = ''" />
    <Notification type="error" :message="errorMsg" :show="!!errorMsg" @dismiss="errorMsg = ''" />

    <!-- Header Profil ala GoPay -->
    <BaseCard class="text-center">
      <div class="flex flex-col items-center">
        <div class="relative">
          <div v-if="fotoPreview || profile?.foto"
            class="w-24 h-24 rounded-full overflow-hidden border-2 border-primary-200 dark:border-primary-800 shadow-md">
            <img :src="fotoPreview || profile?.foto" class="w-full h-full object-cover" />
          </div>
          <div v-else
            class="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 text-4xl font-bold">
            {{ (profile?.namaSiswa || profile?.nama || 'S').charAt(0).toUpperCase() }}
          </div>
          <button
            type="button"
            @click="openEditModal"
            :title="'Ganti Profil'"
            class="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center cursor-pointer shadow-md border-2 border-white dark:border-slate-700 transition-colors"
          >
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <h2 class="mt-3 text-lg font-bold text-gray-900 dark:text-gray-100">{{ profile?.namaSiswa || profile?.nama || '-' }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">Murid · Kelas {{ profile?.kelas?.nama || '-' }}</p>
        <p class="text-xs text-gray-400 dark:text-gray-500">NISN: {{ profile?.nisn || '-' }}</p>

        <button
          type="button"
          @click="openEditModal"
          class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-full shadow-md shadow-primary-500/30 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Ganti Profil
        </button>
      </div>
    </BaseCard>

    <!-- Nama Wali -->
    <BaseCard class="mt-6">
      <div class="flex items-center gap-2 mb-4">
        <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Nama Wali</h3>
      </div>

      <div v-if="profile?.namaWali || profile?.kontakWali" class="flex flex-wrap gap-2">
        <span class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-sm text-gray-800 dark:text-gray-200">
          <span class="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {{ (profile?.namaWali || '?').charAt(0).toUpperCase() }}
          </span>
          {{ profile?.namaWali || '-' }}
        </span>
        <span class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-sm text-gray-800 dark:text-gray-200">
          <svg class="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {{ profile?.kontakWali || '-' }}
        </span>
      </div>
      <p v-else class="text-sm text-gray-500 dark:text-gray-400">Belum ada data wali.</p>
    </BaseCard>

    <!-- PTK Kelas -->
    <BaseCard class="mt-6">
      <div class="flex items-center gap-2 mb-4">
        <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">PTK Wali Kelas</h3>
      </div>

      <div v-if="profile?.waliKelas" class="flex flex-wrap gap-2">
        <span class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-sm text-gray-800 dark:text-gray-200">
          <span class="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {{ profile.waliKelas.nama.charAt(0).toUpperCase() }}
          </span>
          {{ profile.waliKelas.nama }}
        </span>
      </div>
      <p v-else class="text-sm text-gray-500 dark:text-gray-400">Belum ada wali kelas untuk kelas kamu.</p>
    </BaseCard>

    <!-- PTK Pendamping Kelas -->
    <BaseCard class="mt-6">
      <div class="flex items-center gap-2 mb-4">
        <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">PTK Pendamping </h3>
      </div>

      <div v-if="profile?.ptkPendamping?.length" class="flex flex-wrap gap-2">
        <span
          v-for="p in profile.ptkPendamping"
          :key="p.id"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-sm text-gray-800 dark:text-gray-200"
        >
          <span class="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {{ p.nama.charAt(0).toUpperCase() }}
          </span>
          {{ p.nama }}
        </span>
      </div>
      <p v-else class="text-sm text-gray-500 dark:text-gray-400">Belum ada PTK pendamping di kelas kamu.</p>
    </BaseCard>

    <!-- Ubah Password -->
    <BaseCard class="mt-6">
      <div class="flex items-center gap-2 mb-5">
        <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Ubah Password</h3>
      </div>

      <Notification type="success" :message="pwSuccessMsg" :show="!!pwSuccessMsg" @dismiss="pwSuccessMsg = ''" />
      <Notification type="error" :message="pwErrorMsg" :show="!!pwErrorMsg" @dismiss="pwErrorMsg = ''" />

      <form @submit.prevent="handleChangePassword" class="space-y-4 max-w-md">
        <BaseFormField label="Password Saat Ini" required>
          <input v-model="pwForm.currentPassword" type="password" placeholder="Masukkan password saat ini"
            class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
        </BaseFormField>
        <BaseFormField label="Password Baru" required>
          <input v-model="pwForm.newPassword" type="password" placeholder="Minimal 6 karakter"
            class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
        </BaseFormField>
        <BaseFormField label="Konfirmasi Password Baru" required>
          <input v-model="pwForm.confirmPassword" type="password" placeholder="Ketik ulang password baru"
            class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
        </BaseFormField>

        <div class="flex justify-end pt-2">
          <button type="submit" :disabled="savingPw"
            class="px-6 py-2.5 bg-orange-500 text-sm font-medium text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 inline-flex items-center gap-2 shadow-sm">
            <svg v-if="savingPw" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            Ubah Password
          </button>
        </div>
      </form>
    </BaseCard>

    <!-- Modal Ganti Profil -->
    <BaseModal :show="showEditModal" title="Ganti Profil" @close="closeEditModal" max-w="max-w-lg">
      <form @submit.prevent="handleSave" class="space-y-5">
        <div class="flex flex-col items-center gap-2">
          <div class="relative">
            <div v-if="fotoPreview || form.foto"
              class="w-24 h-24 rounded-full overflow-hidden border-2 border-primary-200 dark:border-primary-800 shadow-md">
              <img :src="fotoPreview || form.foto" class="w-full h-full object-cover" />
            </div>
            <div v-else
              class="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 text-3xl font-bold">
              {{ (profile?.namaSiswa || profile?.nama || 'S').charAt(0).toUpperCase() }}
            </div>
            <label class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center cursor-pointer shadow-md border-2 border-white dark:border-slate-700 transition-colors">
              <input type="file" accept="image/png,image/jpeg,image/jpg,image/gif,image/webp" class="sr-only" @change="handleFotoSelect" />
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
          </div>
          <button v-if="fotoPreview || form.foto" type="button" @click="removeFoto"
            class="text-[11px] text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
            Hapus foto
          </button>
        </div>

        <BaseFormField label="Nama Lengkap" required>
          <input v-model="form.nama" type="text"
            class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
        </BaseFormField>
        <BaseFormField label="Email (Akun Login)" required>
          <input v-model="form.email" type="email" required
            class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
        </BaseFormField>
        <BaseFormField label="Nama Wali">
          <input v-model="form.namaWali" type="text" placeholder="Nama orang tua / wali"
            class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
        </BaseFormField>
        <BaseFormField label="Kontak Wali">
          <input v-model="form.kontakWali" type="text" placeholder="Nomor HP wali"
            class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
        </BaseFormField>
      </form>
      <template #footer>
        <button type="button" @click="closeEditModal"
          class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">{{ 'Batal' }}</button>
        <button type="submit" @click="handleSave" :disabled="saving"
          class="px-5 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 disabled:opacity-50 inline-flex items-center gap-2 shadow-sm">
          <svg v-if="saving || fotoUploading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          {{ saving || fotoUploading ? 'Menyimpan...' : 'Simpan' }}
        </button>
      </template>
    </BaseModal>
  </StudentLayout>
</template>