<script setup lang="ts">
interface ProfileData {
  id: number
  nama: string
  nip: string | null
  email: string
  role: string
  isActive: boolean
  waliKelas?: { id: number; nama: string }[]
}

const { data: profile, refresh } = useFetch<ProfileData>('/api/user/profile', { immediate: true })

const form = reactive({
  nama: '',
  email: ''
})

const errorMsg = ref('')
const successMsg = ref('')
const saving = ref(false)

watch(profile, (val) => {
  if (val) {
    form.nama = val.nama
    form.email = val.email
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
</script>

<template>
  <AppLayout>
    <PageHeader title="Profil Saya" description="Informasi akun guru" />

    <Notification type="success" :message="successMsg" :show="!!successMsg" @dismiss="successMsg = ''" />
    <Notification type="error" :message="errorMsg" :show="!!errorMsg" @dismiss="errorMsg = ''" />

    <BaseCard>
      <form @submit.prevent="handleSave" class="space-y-5">
        <!-- Info Card -->
        <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div class="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold flex-shrink-0">
            {{ profile?.nama?.charAt(0)?.toUpperCase() || 'G' }}
          </div>
          <div>
            <h2 class="font-semibold text-gray-900">{{ profile?.nama || '-' }}</h2>
            <p class="text-sm text-gray-500">Guru — {{ profile?.nip || 'Belum ada NIP' }}</p>
            <div v-if="profile?.waliKelas && profile.waliKelas.length > 0" class="flex flex-wrap gap-1 mt-1.5">
              <span v-for="k in profile.waliKelas" :key="k.id"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Wali {{ k.nama }}
              </span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseFormField label="Nama Lengkap" required>
            <input v-model="form.nama" type="text"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </BaseFormField>
          <BaseFormField label="NIP">
            <input :value="profile?.nip || '-'" type="text" disabled
              class="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
          </BaseFormField>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseFormField label="Email" required>
            <input v-model="form.email" type="email"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </BaseFormField>
          <BaseFormField label="Role">
            <input :value="profile?.role || '-'" type="text" disabled
              class="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
          </BaseFormField>
        </div>

        <div class="flex justify-end pt-4 border-t border-gray-200">
          <button type="submit" :disabled="saving"
            class="px-6 py-2.5 bg-blue-600 text-sm font-medium text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2 shadow-sm">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            Simpan Perubahan
          </button>
        </div>
      </form>
    </BaseCard>
  </AppLayout>
</template>
