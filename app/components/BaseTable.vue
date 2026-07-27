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
  <div class="bg-white rounded-lg border border-gray-200 shadow-card overflow-hidden">
    <div class="overflow-x-auto scrollbar-thin">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th
              v-for="col in columns"
              :key="col.key"
              :class="[
                'px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider text-left',
                col.headerClass,
                { 'cursor-pointer select-none': col.sortable }
              ]"
              :style="{ width: col.width }"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="(item, idx) in data"
            :key="item.id || idx"
            @click="emitRowClick(item)"
            :class="[
              { 'hover:bg-gray-50 transition-colors duration-100': hover, 'cursor-pointer': hover },
              { 'bg-gray-50/30': striped && idx % 2 === 1 },
              { 'border-l-2 border-l-transparent': true }
            ]"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              :class="['px-4 py-3 text-gray-700', col.class]"
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
        <div v-for="j in columns.length" :key="j" class="h-4 bg-gray-200 rounded" :style="{ width: (60 + Math.random() * 30) + '%' }"></div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="data.length === 0" class="py-12 text-center">
      <svg class="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-gray-500 font-medium">{{ emptyText }}</p>
      <button
        v-if="emptyActionLabel"
        @click="emitEmptyAction"
        class="mt-3 inline-flex items-center gap-1 px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ emptyActionLabel }}
      </button>
    </div>
  </div>
</template>
