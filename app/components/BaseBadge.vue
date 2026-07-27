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
  green: 'bg-green-50 text-green-700 ring-1 ring-green-200',
  red: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  blue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  amber: 'bg-accent-50 text-primary-800 ring-1 ring-accent-200 font-semibold',
  gray: 'bg-gray-50 text-gray-500 ring-1 ring-gray-200',
  purple: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  cyan: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',
  primary: 'bg-primary-50 text-primary-700 ring-1 ring-primary-200 font-semibold',
}

const dotColors = {
  green: 'bg-green-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  amber: 'bg-accent-500',
  gray: 'bg-gray-400',
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
