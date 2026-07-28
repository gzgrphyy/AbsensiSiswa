<script setup lang="ts">
import { inject } from 'vue'

withDefaults(defineProps<{
  padding?: 'sm' | 'md' | 'lg' | 'none'
  hover?: boolean
}>(), {
  padding: 'md',
  hover: false,
})

const isAdmin = inject('isAdmin', false)

const paddings = {
  none: '',
  sm: isAdmin ? 'p-3' : 'p-4',
  md: isAdmin ? 'p-4' : 'p-5',
  lg: isAdmin ? 'p-5' : 'p-6',
}
</script>

<template>
  <div
    :class="[
      'bg-white dark:bg-slate-800 transition-all duration-200',
      isAdmin
        ? 'rounded-sm border border-gray-300 dark:border-gray-600'
        : 'rounded-xl border border-gray-100 dark:border-slate-700 shadow-card dark:shadow-dark-card',
      paddings[padding],
      { 'hover:border-gray-400 dark:hover:border-gray-500': hover && isAdmin },
      { 'hover:shadow-card-hover hover:border-gray-200 dark:hover:border-slate-600': hover && !isAdmin }
    ]"
  >
    <slot />
  </div>
</template>
