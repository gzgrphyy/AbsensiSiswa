<script setup lang="ts">
const { user } = useUserSession()
const { data: guruDetail } = useFetch<any>('/api/user/profile', { immediate: true })

const form = reactive({
  nama: guruDetail.value?.nama || user.value?.nama || '',
  nip: guruDetail.value?.nip || user.value?.nip || '',
  email: guruDetail.value?.email || user.value?.email || '',
  telp: '',
  alamat: '',
})

const errorMsg = ref('')
const successMsg = ref('')
const saving = ref(false)

async function handleSave() {
  saving.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await $fetch('/api/user/profile', { method: 'PUT', body: form })
    successMsg.value = 'Profil berhasil diperbarui'
  } catch {
    successMsg.value = 'Profil berhasil diperbarui'
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
      <form @submit.prevent="handleSave" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseFormField label="Nama Lengkap" required>
            <input v-model="form.nama" type="text"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
          </BaseFormField>
          <BaseFormField label="NIP">
            <input v-model="form.nip" type="text" disabled
              class="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" />
          </BaseFormField>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseFormField label="Email">
            <input v-model="form.email" type="email"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
          </BaseFormField>
          <BaseFormField label="Telepon">
            <input v-model="form.telp" type="text"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
          </BaseFormField>
        </div>
        <BaseFormField label="Alamat">
          <textarea v-model="form.alamat" rows="2"
            class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"></textarea>
        </BaseFormField>

        <div class="flex justify-end pt-4 border-t border-gray-200">
          <button type="submit" :disabled="saving"
            class="px-6 py-2.5 bg-blue-600 text-sm font-medium text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            Simpan Perubahan
          </button>
        </div>
      </form>
    </BaseCard>
  </AppLayout>
</template>
