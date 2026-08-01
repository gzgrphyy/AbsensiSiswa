<script setup lang="ts">
</script>

<template>
  <StudentLayout>
    <PageHeader title="Izin / Sakit" description="Pengajuan izin kehadiran" :show-back="false" />

    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-card dark:shadow-dark-card">
      <div class="flex flex-col items-center py-16 px-6 text-center">
        <div class="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">Pengajuan Izin / Sakit</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-xs">
          Fitur pengajuan izin dan keterangan sakit akan segera hadir. Sementara itu, hubungi wali kelas secara langsung.
        </p>
      </div>
    </div>
  </StudentLayout>
</template>
