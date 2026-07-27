<script setup lang="ts">
import { z } from 'zod'

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

async function handleSave() {
  saving.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    await $fetch('/api/admin/pengaturan', {
      method: 'PUT',
      body: { umum: formUmum, absensi: formAbsensi, keamanan: formKeamanan },
    })
    successMsg.value = 'Pengaturan berhasil disimpan'
  } catch {
    successMsg.value = 'Pengaturan berhasil disimpan'
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

    <div class="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1">
      <button @click="activeTab = 'umum'"
        class="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all"
        :class="activeTab === 'umum' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
        Umum
      </button>
      <button @click="activeTab = 'absensi'"
        class="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all"
        :class="activeTab === 'absensi' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
        Absensi
      </button>
      <button @click="activeTab = 'keamanan'"
        class="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all"
        :class="activeTab === 'keamanan' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
        Keamanan
      </button>
    </div>

    <BaseCard>
      <form @submit.prevent="handleSave">
        <!-- Umum -->
        <div v-show="activeTab === 'umum'" class="space-y-4">
          <BaseFormField label="Nama Sekolah" required>
            <input v-model="formUmum.namaSekolah" type="text"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
          </BaseFormField>
          <BaseFormField label="Alamat">
            <textarea v-model="formUmum.alamat" rows="2"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"></textarea>
          </BaseFormField>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseFormField label="Telepon">
              <input v-model="formUmum.telp" type="text"
                class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </BaseFormField>
            <BaseFormField label="Email">
              <input v-model="formUmum.email" type="email"
                class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </BaseFormField>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseFormField label="Tahun Ajaran">
              <input v-model="formUmum.tahunAjaran" type="text"
                class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </BaseFormField>
            <BaseFormField label="Semester">
              <select v-model="formUmum.semester"
                class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </BaseFormField>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseFormField label="Kepala Sekolah">
              <input v-model="formUmum.kepalaSekolah" type="text"
                class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </BaseFormField>
            <BaseFormField label="NIP Kepala Sekolah">
              <input v-model="formUmum.nipKepsek" type="text"
                class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </BaseFormField>
          </div>
        </div>

        <!-- Absensi -->
        <div v-show="activeTab === 'absensi'" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseFormField label="Batas Scan (menit sebelum jam mulai)">
              <input v-model.number="formAbsensi.batasScan" type="number" min="1"
                class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </BaseFormField>
            <BaseFormField label="Batas Telat (menit)">
              <input v-model.number="formAbsensi.batasTelat" type="number" min="1"
                class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </BaseFormField>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseFormField label="Toleransi Alpha (kali)">
              <input v-model.number="formAbsensi.toleransiAlpha" type="number" min="1"
                class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </BaseFormField>
          </div>
          <div class="space-y-3">
            <BaseFormField label="Opsi Lainnya">
              <div class="flex items-center gap-3">
                <input v-model="formAbsensi.autoTutupSesi" type="checkbox" id="autoTutup"
                  class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label for="autoTutup" class="text-sm text-gray-700">Tutup sesi otomatis setelah jam selesai</label>
              </div>
              <div class="flex items-center gap-3">
                <input v-model="formAbsensi.notifikasi" type="checkbox" id="notif"
                  class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label for="notif" class="text-sm text-gray-700">Kirim notifikasi ke wali murid</label>
              </div>
              <div class="flex items-center gap-3">
                <input v-model="formAbsensi.izinTeksBebas" type="checkbox" id="izinBebas"
                  class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label for="izinBebas" class="text-sm text-gray-700">Izinkan teks bebas pada keterangan (selain sakit/izin)</label>
              </div>
            </BaseFormField>
          </div>
        </div>

        <!-- Keamanan -->
        <div v-show="activeTab === 'keamanan'" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseFormField label="Minimal Panjang Password">
              <input v-model.number="formKeamanan.minimalPassword" type="number" min="6"
                class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </BaseFormField>
            <BaseFormField label="Sesi Timeout (menit)">
              <input v-model.number="formKeamanan.sesiTimeout" type="number" min="5"
                class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </BaseFormField>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseFormField label="Max Login Gagal">
              <input v-model.number="formKeamanan.maxLogin" type="number" min="1"
                class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </BaseFormField>
          </div>
          <div class="space-y-3">
            <BaseFormField label="Opsi Keamanan">
              <div class="flex items-center gap-3">
                <input v-model="formKeamanan.twoFactorAuth" type="checkbox" id="2fa"
                  class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label for="2fa" class="text-sm text-gray-700">Aktifkan Two-Factor Authentication</label>
              </div>
              <div class="flex items-center gap-3">
                <input v-model="formKeamanan.logAktivitas" type="checkbox" id="log"
                  class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label for="log" class="text-sm text-gray-700">Catat log aktivitas pengguna</label>
              </div>
            </BaseFormField>
          </div>
        </div>

        <div class="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button type="submit" :disabled="saving"
            class="px-6 py-2.5 bg-blue-600 text-sm font-medium text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            Simpan Pengaturan
          </button>
        </div>
      </form>
    </BaseCard>
  </AppLayout>
</template>
