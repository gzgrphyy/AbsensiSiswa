<script setup lang="ts">
import type { Component } from 'vue'

interface Column {
  key: string
  label: string
  class?: string
  headerClass?: string
  sortable?: boolean
  width?: string
}

withDefaults(defineProps<{
  columns: Column[]
  data: any[]
  loading?: boolean
  emptyText?: string
  emptyActionLabel?: string
  stickyHeader?: boolean
  dense?: boolean
  hover?: boolean
  striped?: boolean
}>(), {
  loading: false,
  emptyText: 'Belum ada data',
  stickyHeader: false,
  dense: false,
  hover: true,
  striped: false,
})

const emit = defineEmits<{
  'empty-action': []
  'row-click': [item: any]
}>()

const emitRowClick = (item: any) => {
  emit('row-click', item)
}

const emitEmptyAction = () => {
  emit('empty-action')
}
</script>

<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-card dark:shadow-dark-card overflow-hidden">
    <div class="overflow-x-auto scrollbar-thin">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 dark:bg-slate-800/80">
            <th
              v-for="col in columns"
              :key="col.key"
              :class="[
                'px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-left',
                col.headerClass,
                { 'cursor-pointer select-none': col.sortable }
              ]"
              :style="{ width: col.width }"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50 dark:divide-slate-700/50">
          <tr
            v-for="(item, idx) in data"
            :key="item.id || idx"
            @click="emitRowClick(item)"
            :class="[
              { 'hover:bg-primary-50/40 dark:hover:bg-primary-900/20 transition-colors duration-100': hover, 'cursor-pointer': hover },
              { 'bg-gray-50/30 dark:bg-slate-700/20': striped && idx % 2 === 1 },
            ]"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              :class="['px-4 py-3 text-gray-600 dark:text-gray-300', col.class]"
            >
              <slot :name="`cell-${col.key}`" :item="item" :value="item[col.key]">
                {{ item[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="p-6 space-y-3">
      <div v-for="i in 4" :key="i" class="flex items-center gap-4 animate-pulse">
        <div v-for="j in columns.length" :key="j" class="h-3 bg-gray-100 dark:bg-slate-700 rounded" :style="{ width: (60 + Math.random() * 30) + '%' }"></div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="data.length === 0" class="py-12 text-center">
      <svg class="w-10 h-10 text-gray-200 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-gray-400 dark:text-gray-500 font-medium">{{ emptyText }}</p>
      <button
        v-if="emptyActionLabel"
        @click="emitEmptyAction"
        class="mt-3 inline-flex items-center gap-1 px-4 py-2 text-sm text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all duration-150"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ emptyActionLabel }}
      </button>
    </div>
  </div>
</template>
