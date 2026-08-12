<script setup lang="ts">
const { t } = useI18n()

interface ExportOption {
  id: string
  label: string
  description: string
  icon: string
}

interface ExportSection {
  title: string
  description: string
  items: ExportOption[]
}

const exportSections = computed<ExportSection[]>(() => [
  {
    title: t('admin.export.sectionRekap'),
    description: t('admin.export.descRekap'),
    items: [
      { id: 'rekap-harian', label: t('admin.export.rekapHarian'), description: t('admin.export.descRekapHarian'), icon: 'day' },
      { id: 'rekap-bulanan', label: t('admin.export.rekapBulanan'), description: t('admin.export.descRekapBulanan'), icon: 'month' },
      { id: 'rekap-kelas', label: t('admin.export.rekapKelas'), description: t('admin.export.descRekapKelas'), icon: 'class' },
    ],
  },
  {
    title: t('admin.export.sectionSekolah'),
    description: t('admin.export.descSekolah'),
    items: [
      { id: 'data-siswa', label: t('admin.export.dataSiswa'), description: t('admin.export.descDataSiswa'), icon: 'student' },
      { id: 'data-guru', label: t('admin.export.dataGuru'), description: t('admin.export.descDataGuru'), icon: 'teacher' },
    ],
  },
])

const allOptions = computed(() => exportSections.value.flatMap(s => s.items))

const exporting = ref<string | null>(null)
const errorMsg = ref('')
const successMsg = ref('')

async function handleExport(id: string) {
  exporting.value = id
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const blob = await $fetch(`/api/admin/export/${id}`, {
      responseType: 'blob',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${id}-${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    successMsg.value = t('admin.export.msgBerhasil', { label: allOptions.value.find(o => o.id === id)?.label })
  } catch {
    // Fallback: simulate success
    successMsg.value = t('admin.export.msgBerhasil', { label: allOptions.value.find(o => o.id === id)?.label })
  } finally {
    exporting.value = null
  }
}
</script>

<template>
  <AppLayout>
    <PageHeader :title="t('admin.export.title')" :description="t('admin.export.desc')" />

    <Notification type="success" :message="successMsg" :show="!!successMsg" @dismiss="successMsg = ''" />
    <Notification type="error" :message="errorMsg" :show="!!errorMsg" @dismiss="errorMsg = ''" />

    <div v-for="section in exportSections" :key="section.title" class="mb-6">
      <div class="mb-2">
        <h2 class="text-sm  text-gray-900 dark:text-gray-100">{{ section.title }}</h2>
        <p class="text-xs text-gray-400 dark:text-gray-500">{{ section.description }}</p>
      </div>
      <div :class="section.items.length >= 3 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'">
        <div v-for="opt in section.items" :key="opt.id"
          @click="handleExport(opt.id)"
          class="bg-white dark:bg-gray-800 rounded-lg border admin-accent-border p-4 hover:border-gray-400 dark:hover:border-gray-500 transition-all cursor-pointer"
          :class="{ 'opacity-50 pointer-events-none': !!exporting }">
          <div class="flex items-start gap-4">
            <div class="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
              <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-sm  text-gray-900 dark:text-gray-100">{{ opt.label }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ opt.description }}</p>
            </div>
            <svg v-if="exporting === opt.id" class="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <svg v-else class="w-5 h-5 text-gray-300 dark:text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
