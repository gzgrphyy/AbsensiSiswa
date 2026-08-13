<script setup lang="ts">
const { t } = useI18n()

interface ProfileData {
  id: number
  nama: string
  foto: string | null
  email: string
  role: string
  isActive: boolean
}

const { data: profile, refresh } = useFetch<ProfileData>('/api/user/profile', { immediate: true })

const form = reactive({
  nama: '',
  email: '',
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

const pwErrorMsg = ref('')
const pwSuccessMsg = ref('')
const savingPw = ref(false)

watch(profile, (val) => {
  if (val) {
    form.nama = val.nama
    form.email = val.email
    form.foto = val.foto
  }
}, { immediate: true })

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
      errorMsg.value = t('admin.profil.fotoTerlaluBesar')
      target.value = ''
      return
    }
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'].includes(file.type)) {
      errorMsg.value = t('admin.profil.fotoTipe')
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
    if (form.email) body.email = form.email
    if (form.foto !== undefined) body.foto = form.foto

    await $fetch('/api/user/profile', { method: 'PUT', body })
    successMsg.value = t('admin.profil.msgBerhasilUpdate')
    await refresh()
  } catch (err: any) {
    fotoUploading.value = false
    errorMsg.value = err?.data?.statusMessage || t('admin.profil.msgGagalUpdate')
  } finally {
    saving.value = false
  }
}

async function handleChangePassword() {
  pwErrorMsg.value = ''
  pwSuccessMsg.value = ''

  if (!pwForm.currentPassword) {
    pwErrorMsg.value = t('admin.profil.pwWajib')
    return
  }
  if (!pwForm.newPassword) {
    pwErrorMsg.value = t('admin.profil.pwBaruWajib')
    return
  }
  if (pwForm.newPassword.length < 6) {
    pwErrorMsg.value = t('admin.profil.pwBaruMinimal')
    return
  }
  if (pwForm.newPassword !== pwForm.confirmPassword) {
    pwErrorMsg.value = t('admin.profil.pwTidakCocok')
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
    pwSuccessMsg.value = t('admin.profil.msgBerhasilPw')
    pwForm.currentPassword = ''
    pwForm.newPassword = ''
    pwForm.confirmPassword = ''
  } catch (err: any) {
    pwErrorMsg.value = err?.data?.statusMessage || t('admin.profil.msgGagalPw')
  } finally {
    savingPw.value = false
  }
}
</script>

<template>
  <AppLayout>
    <PageHeader :title="t('admin.profil.title')" :description="t('admin.profil.desc')" />

    <Notification type="success" :message="successMsg" :show="!!successMsg" @dismiss="successMsg = ''" />
    <Notification type="error" :message="errorMsg" :show="!!errorMsg" @dismiss="errorMsg = ''" />

    <BaseCard>
      <form @submit.prevent="handleSave" class="space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-100 dark:border-slate-600">
          <div class="relative w-fit">
            <div v-if="fotoPreview || form.foto"
              class="w-28 h-28 rounded-xl overflow-hidden border-2 border-blue-200 dark:border-blue-800">
              <img :src="fotoPreview || form.foto" class="w-full h-full object-cover" />
            </div>
            <div v-else
              class="w-28 h-28 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-300 text-4xl">
              {{ profile?.nama?.charAt(0)?.toUpperCase() || 'A' }}
            </div>
            <label class="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-blue-500 hover:bg-blue-600 flex items-center justify-center cursor-pointer shadow-sm border-2 border-white dark:border-slate-700">
              <input type="file" accept="image/png,image/jpeg,image/jpg,image/gif,image/webp" class="sr-only" @change="handleFotoSelect" />
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </label>
            <div class="flex justify-end">
              <button v-if="fotoPreview || form.foto" type="button" @click="removeFoto"
                class="mt-2 translate-x-[-29px] text-[11px] text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                {{ t('admin.profil.hapusFoto') }}
              </button>
             </div>
          </div>
          <div class="min-w-0 space-y-4">
            <BaseFormField :label="t('admin.profil.labelNama')" required>
              <input v-model="form.nama" type="text"
                class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </BaseFormField>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseFormField :label="t('admin.profil.labelEmail')" required>
                <input v-model="form.email" type="email"
                  class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
               </BaseFormField>
               <BaseFormField :label="t('admin.profil.labelRole')">
                 <input :value="t('role.admin')" type="text" disabled
                   class="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
              </BaseFormField>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
          <button type="submit" :disabled="saving"
            class="px-6 py-2.5 bg-primary-500 text-sm  text-white rounded-md hover:bg-primary-600 disabled:opacity-50 inline-flex items-center gap-2 shadow-sm">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            {{ t('admin.profil.simpanPerubahan') }}
          </button>
        </div>
      </form>
    </BaseCard>

    <BaseCard class="mt-6">
      <div class="flex items-center gap-2 mb-5">
        <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 class="text-base  text-gray-900 dark:text-gray-100">{{ t('admin.profil.ubahPassword') }}</h3>
      </div>

      <Notification type="success" :message="pwSuccessMsg" :show="!!pwSuccessMsg" @dismiss="pwSuccessMsg = ''" />
      <Notification type="error" :message="pwErrorMsg" :show="!!pwErrorMsg" @dismiss="pwErrorMsg = ''" />

      <form @submit.prevent="handleChangePassword" class="space-y-4 max-w-md">
        <BaseFormField :label="t('admin.profil.labelPasswordSaatIni')" required>
          <input v-model="pwForm.currentPassword" type="password" :placeholder="t('admin.profil.placeholderPasswordSaatIni')"
            class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
        </BaseFormField>
        <BaseFormField :label="t('admin.profil.labelPasswordBaru')" required>
          <input v-model="pwForm.newPassword" type="password" :placeholder="t('admin.profil.placeholderPasswordBaru')"
            class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
        </BaseFormField>
        <BaseFormField :label="t('admin.profil.labelKonfirmasiPassword')" required>
          <input v-model="pwForm.confirmPassword" type="password" :placeholder="t('admin.profil.placeholderKonfirmasiPassword')"
            class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
        </BaseFormField>

        <div class="flex justify-end pt-2">
          <button type="submit" :disabled="savingPw"
            class="px-6 py-2.5 bg-orange-500 text-sm  text-white rounded-md hover:bg-orange-600 disabled:opacity-50 inline-flex items-center gap-2 shadow-sm">
            <svg v-if="savingPw" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            {{ t('admin.profil.ubahPassword') }}
          </button>
        </div>
      </form>
    </BaseCard>
  </AppLayout>
</template>
