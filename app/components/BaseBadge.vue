<script setup lang="ts">
import { inject } from 'vue'

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

const isAdmin = inject('isAdmin', false)

const variants = {
  green: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 ring-1 ring-green-200 dark:ring-green-800',
  red: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800',
  blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800',
  amber: 'bg-accent-50 dark:bg-amber-900/30 text-primary-800 dark:text-amber-200 ring-1 ring-accent-200 dark:ring-amber-800 ',
  gray: 'bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-slate-600',
  purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 ring-1 ring-purple-200 dark:ring-purple-800',
  cyan: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-200 dark:ring-cyan-800',
  primary: 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-1 ring-primary-200 dark:ring-primary-800 ',
}

const adminVariants: Record<string, string> = {
  green: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 ring-1 ring-green-300 dark:ring-green-800',
  red: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 ring-1 ring-red-300 dark:ring-red-800',
  blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-300 dark:ring-blue-800',
  amber: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-800',
  gray: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-gray-600',
  purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 ring-1 ring-purple-300 dark:ring-purple-800',
  cyan: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-300 dark:ring-cyan-800',
  primary: 'bg-blue-600 text-white',
}

const adminDotColors: Record<string, string> = {
  green: 'bg-green-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  gray: 'bg-gray-400 dark:bg-gray-500',
  purple: 'bg-purple-500',
  cyan: 'bg-cyan-500',
  primary: 'bg-blue-600',
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
  <span v-if="isAdmin" :class="['inline-flex items-center gap-1  rounded-lg', adminVariants[variant] || adminVariants.gray, size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs']">
    <span v-if="dot" :class="['w-1.5 h-1.5 rounded-full', adminDotColors[variant], { 'animate-pulse': pulse }]" />
    <slot />
  </span>
  <span v-else :class="['inline-flex items-center gap-1  rounded-full', variants[variant], sizes[size]]">
    <span v-if="dot" :class="['w-1.5 h-1.5 rounded-full', dotColors[variant], { 'animate-pulse': pulse }]" />
    <slot />
  </span>
</template>
