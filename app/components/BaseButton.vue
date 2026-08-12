<script setup lang="ts">
import { inject } from 'vue'

withDefaults(defineProps<{
  variant?: 'primary' | 'danger' | 'success' | 'warning' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  iconOnly?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  iconOnly: false,
})

const isAdmin = inject('isAdmin', false)

const emit = defineEmits<{ click: [] }>()

const variants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
  warning: 'bg-accent-500 text-primary-900 hover:bg-accent-600 active:bg-accent-700 font-semibold',
  ghost: 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30',
  outline: 'border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30',
}

const adminVariants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  danger: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800',
  success: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800',
  warning: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800',
  ghost: 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700',
  outline: 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700',
}

const sizes = {
  sm: (iconOnly: boolean) => iconOnly ? 'p-1.5 text-xs' : 'px-2.5 py-1.5 text-xs',
  md: (iconOnly: boolean) => iconOnly ? 'p-2 text-sm' : 'px-3.5 py-2 text-sm',
  lg: (iconOnly: boolean) => iconOnly ? 'p-2.5 text-sm' : 'px-4 py-2.5 text-sm',
}
</script>

<template>
  <button
    @click="emit('click')"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed',
      isAdmin ? (adminVariants[variant] || adminVariants.primary) : variants[variant],
      isAdmin ? 'rounded-md' : 'rounded-lg',
      sizes[size](iconOnly),
    ]"
  >
    <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <slot />
  </button>
</template>
