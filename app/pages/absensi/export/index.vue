<script setup lang="ts">
const exporting = ref<string | null>(null)
const successMsg = ref('')

const options = [
  { id: 'rekap-saya', label: 'Rekap Saya', description: 'Rekap absensi pribadi' },
  { id: 'rekap-kelas', label: 'Rekap Kelas', description: 'Rekap absensi seluruh siswa kelas' },
]

async function handleExport(id: string) {
  exporting.value = id
  successMsg.value = ''
  try {
    await $fetch(`/api/absensi/export/${id}`, { responseType: 'blob' })
  } catch {}
  successMsg.value = `Export "${options.find(o => o.id === id)?.label}" berhasil`
  exporting.value = null
}
</script>

<template>
  <AppLayout>
    <PageHeader title="Export Data" description="Unduh data absensi" />

    <Notification type="success" :message="successMsg" :show="!!successMsg" @dismiss="successMsg = ''" />

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-for="opt in options" :key="opt.id"
        @click="handleExport(opt.id)"
        class="bg-white rounded-lg border border-gray-200 shadow-card p-5 hover:shadow-card-hover hover:border-blue-200 transition-all cursor-pointer max-w-sm"
        :class="{ 'opacity-50 pointer-events-none': !!exporting }">
        <div class="flex items-start gap-4">
          <div class="p-2.5 bg-green-100 rounded-lg flex-shrink-0">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-semibold text-gray-900">{{ opt.label }}</h3>
            <p class="text-xs text-gray-500 mt-1">{{ opt.description }}</p>
          </div>
          <svg v-if="exporting === opt.id" class="w-5 h-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          <svg v-else class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
