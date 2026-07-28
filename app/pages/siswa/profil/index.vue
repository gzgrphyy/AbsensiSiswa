<script setup lang="ts">
interface ProfileData {
  id: number
  nama: string
  nip: string | null
  email: string
  role: string
  nisn?: string
  namaSiswa?: string
  kelas?: { id: number; nama: string }
  namaWali?: string | null
  kontakWali?: string | null
}

const { data: profile, refresh } = useFetch<ProfileData>('/api/user/profile', { immediate: true })

const form = reactive({
  nama: '',
  namaWali: '',
  kontakWali: ''
})

const pwForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const errorMsg = ref('')
const successMsg = ref('')
const saving = ref(false)

const pwErrorMsg = ref('')
const pwSuccessMsg = ref('')
const savingPw = ref(false)

watch(profile, (val) => {
  if (val) {
    form.nama = val.namaSiswa || val.nama || ''
    form.namaWali = val.namaWali || ''
    form.kontakWali = val.kontakWali || ''
  }
}, { immediate: true })

async function handleSave() {
  saving.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await $fetch('/api/user/profile', { method: 'PUT', body: form })
    successMsg.value = 'Profil berhasil diperbarui'
    await refresh()
  } catch (err: any) {
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
  <AppLayout>
    <PageHeader title="Profil Saya" description="Informasi akun siswa" />

    <Notification type="success" :message="successMsg" :show="!!successMsg" @dismiss="successMsg = ''" />
    <Notification type="error" :message="errorMsg" :show="!!errorMsg" @dismiss="errorMsg = ''" />

    <BaseCard>
      <form @submit.prevent="handleSave" class="space-y-5">
        <!-- Info Card -->
        <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl font-bold flex-shrink-0">
            {{ (profile?.namaSiswa || profile?.nama || 'S').charAt(0).toUpperCase() }}
          </div>
          <div>
            <h2 class="font-semibold text-gray-900">{{ profile?.namaSiswa || profile?.nama || '-' }}</h2>
            <p class="text-sm text-gray-500">Siswa — {{ profile?.kelas?.nama || '-' }}</p>
            <p class="text-xs text-gray-400">NISN: {{ profile?.nisn || '-' }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseFormField label="Nama Lengkap" required>
            <input v-model="form.nama" type="text"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </BaseFormField>
          <BaseFormField label="NISN">
            <input :value="profile?.nisn || '-'" type="text" disabled
              class="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
          </BaseFormField>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseFormField label="Email (Akun Login)">
            <input :value="profile?.email || '-'" type="email" disabled
              class="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
          </BaseFormField>
          <BaseFormField label="Kelas">
            <input :value="profile?.kelas?.nama || '-'" type="text" disabled
              class="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
          </BaseFormField>
        </div>

        <div class="border-t border-gray-100 pt-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Informasi Wali Murid</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseFormField label="Nama Wali">
              <input v-model="form.namaWali" type="text" placeholder="Nama orang tua / wali"
                class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400" />
            </BaseFormField>
            <BaseFormField label="Kontak Wali">
              <input v-model="form.kontakWali" type="text" placeholder="Nomor HP wali"
                class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400" />
            </BaseFormField>
          </div>
        </div>

        <div class="flex justify-end pt-4 border-t border-gray-200">
          <button type="submit" :disabled="saving"
            class="px-6 py-2.5 bg-primary-500 text-sm font-medium text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 inline-flex items-center gap-2 shadow-sm">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            Simpan Perubahan
          </button>
        </div>
      </form>
    </BaseCard>

    <!-- Ubah Password -->
    <BaseCard class="mt-6">
      <div class="flex items-center gap-2 mb-5">
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 class="text-base font-semibold text-gray-900">Ubah Password</h3>
      </div>

      <Notification type="success" :message="pwSuccessMsg" :show="!!pwSuccessMsg" @dismiss="pwSuccessMsg = ''" />
      <Notification type="error" :message="pwErrorMsg" :show="!!pwErrorMsg" @dismiss="pwErrorMsg = ''" />

      <form @submit.prevent="handleChangePassword" class="space-y-4 max-w-md">
        <BaseFormField label="Password Saat Ini" required>
          <input v-model="pwForm.currentPassword" type="password" placeholder="Masukkan password saat ini"
            class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400" />
        </BaseFormField>
        <BaseFormField label="Password Baru" required>
          <input v-model="pwForm.newPassword" type="password" placeholder="Minimal 6 karakter"
            class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400" />
        </BaseFormField>
        <BaseFormField label="Konfirmasi Password Baru" required>
          <input v-model="pwForm.confirmPassword" type="password" placeholder="Ketik ulang password baru"
            class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400" />
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
  </AppLayout>
</template>
