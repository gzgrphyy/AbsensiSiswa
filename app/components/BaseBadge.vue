<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'green' | 'red' | 'blue' | 'amber' | 'gray' | 'purple' | 'cyan'
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
  green: 'bg-green-100 text-green-800 ring-1 ring-green-200',
  red: 'bg-red-100 text-red-800 ring-1 ring-red-200',
  blue: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200',
  amber: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
  gray: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  purple: 'bg-purple-100 text-purple-800 ring-1 ring-purple-200',
  cyan: 'bg-cyan-100 text-cyan-800 ring-1 ring-cyan-200',
}

const dotColors = {
  green: 'bg-green-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  gray: 'bg-gray-400',
  purple: 'bg-purple-500',
  cyan: 'bg-cyan-500',
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
