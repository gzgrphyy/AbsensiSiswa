<script setup lang="ts">
withDefaults(defineProps<{
  padding?: 'sm' | 'md' | 'lg' | 'none'
  hover?: boolean
}>(), {
  padding: 'md',
  hover: false,
})

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}
</script>

<template>
  <div
    :class="[
      'bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-card dark:shadow-dark-card',
      paddings[padding],
      { 'hover:shadow-card-hover hover:border-gray-200 dark:hover:border-slate-600 transition-all duration-200': hover }
    ]"
  >
    <slot />
  </div>
</template>
