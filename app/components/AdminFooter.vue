<script setup lang="ts">
const { pengaturan } = usePengaturan()
const { t } = useI18n()
const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="border-t border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-4 py-1.5 flex items-center justify-between">
    <span class="text-[10px] text-gray-400 dark:text-gray-500">&copy; {{ currentYear }} {{ t('app.aplikasiSkoria') }}</span>
    <span class="text-[10px] text-gray-400 dark:text-gray-500 font-mono">v1.0 — Developed by Geza Aditya Pratama</span>
  </div>
</template>
