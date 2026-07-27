<script setup lang="ts">
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

const emit = defineEmits<{ click: [] }>()

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
  success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm',
  warning: 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 shadow-sm',
  ghost: 'text-gray-600 hover:text-gray-800 hover:bg-gray-100',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
}

const sizes = {
  sm: iconOnly => iconOnly ? 'p-1.5 text-xs' : 'px-2.5 py-1.5 text-xs',
  md: iconOnly => iconOnly ? 'p-2 text-sm' : 'px-3.5 py-2 text-sm',
  lg: iconOnly => iconOnly ? 'p-2.5 text-sm' : 'px-4 py-2.5 text-sm',
}
</script>

<template>
  <button
    @click="emit('click')"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed',
      variants[variant],
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
