<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'green' | 'red' | 'blue' | 'amber' | 'gray' | 'purple' | 'cyan' | 'primary'
  size?: 'sm' | 'md'
  dot?: boolean
  pulse?: boolean
}>(), {
  variant: 'gray',
  size: 'md',
  dot: false,
  pulse: false,
})

const variants = {
  green: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 ring-1 ring-green-200 dark:ring-green-800',
  red: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800',
  blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800',
  amber: 'bg-accent-50 dark:bg-amber-900/30 text-primary-800 dark:text-amber-200 ring-1 ring-accent-200 dark:ring-amber-800 font-semibold',
  gray: 'bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-slate-600',
  purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 ring-1 ring-purple-200 dark:ring-purple-800',
  cyan: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-200 dark:ring-cyan-800',
  primary: 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-1 ring-primary-200 dark:ring-primary-800 font-semibold',
}

const dotColors = {
  green: 'bg-green-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  amber: 'bg-accent-500',
  gray: 'bg-gray-400 dark:bg-gray-500',
  purple: 'bg-purple-500',
  cyan: 'bg-cyan-500',
  primary: 'bg-primary-500',
}

const sizes = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
}
</script>

<template>
  <span :class="['inline-flex items-center gap-1 font-medium rounded-full', variants[variant], sizes[size]]">
    <span v-if="dot" :class="['w-1.5 h-1.5 rounded-full', dotColors[variant], { 'animate-pulse': pulse }]" />
    <slot />
  </span>
</template>
