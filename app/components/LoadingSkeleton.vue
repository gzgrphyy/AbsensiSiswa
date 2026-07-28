<script setup lang="ts">
withDefaults(defineProps<{
  rows?: number
  type?: 'table' | 'card' | 'text'
  columns?: number
}>(), {
  rows: 4,
  type: 'text',
  columns: 4,
})
</script>

<template>
  <div v-if="type === 'table'" class="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-card dark:shadow-dark-card p-5 space-y-4">
    <div v-for="i in rows" :key="i" class="flex items-center gap-4 animate-pulse">
      <div v-for="j in columns" :key="j" class="h-3 bg-gray-100 dark:bg-slate-700 rounded" :style="{ width: (50 + Math.random() * 40) + '%' }"></div>
    </div>
  </div>
  <div v-else-if="type === 'card'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div v-for="i in rows" :key="i" class="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-card dark:shadow-dark-card p-5 animate-pulse">
      <div class="h-3 bg-gray-100 dark:bg-slate-700 rounded w-20 mb-2"></div>
      <div class="h-6 bg-gray-100 dark:bg-slate-700 rounded w-12"></div>
    </div>
  </div>
  <div v-else class="space-y-2 animate-pulse">
    <div v-for="i in rows" :key="i" class="h-3 bg-gray-100 dark:bg-slate-700 rounded" :style="{ width: (60 + Math.random() * 30) + '%' }"></div>
  </div>
</template>
