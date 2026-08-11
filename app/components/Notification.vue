<script setup lang="ts">
import { inject } from 'vue'

withDefaults(defineProps<{
  type?: 'success' | 'error' | 'warning' | 'info'
  message: string
  show: boolean
}>(), {
  type: 'info',
  show: false,
})

const isAdmin = inject('isAdmin', false)

const emit = defineEmits<{ dismiss: [] }>()

const styles = {
  success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
  error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
  warning: 'bg-accent-50 dark:bg-amber-900/30 border-accent-200 dark:border-amber-800 text-primary-900 dark:text-amber-200',
  info: 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800 text-primary-800 dark:text-primary-200',
}

const adminStyles = {
  success: 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200',
  error: 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200',
  warning: 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200',
  info: 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200',
}

const icons = {
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  error: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}
</script>

<template>
  <Transition name="slide">
    <div v-if="show" :class="[isAdmin ? 'mb-3 px-3 py-2 rounded-lg border text-xs flex items-center gap-2' : 'mb-4 px-4 py-3 rounded-xl border text-sm flex items-center gap-2.5 shadow-card', isAdmin ? adminStyles[type] : styles[type]]">
      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons[type]" />
      </svg>
      <span class="flex-1">{{ message }}</span>
      <button @click="emit('dismiss')" class="p-0.5 hover:opacity-70 rounded transition-opacity flex-shrink-0">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </Transition>
</template>
