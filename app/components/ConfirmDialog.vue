<script setup lang="ts">
withDefaults(defineProps<{
  show: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'success' | 'primary'
  loading?: boolean
}>(), {
  confirmLabel: 'Ya',
  cancelLabel: 'Batal',
  variant: 'danger',
  loading: false,
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const btnVariants = {
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  warning: 'bg-accent-500 hover:bg-accent-600 text-primary-900',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  primary: 'bg-primary-500 hover:bg-primary-600 text-white',
}

const iconVariants = {
  danger: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  warning: 'bg-accent-50 dark:bg-amber-900/30 text-primary-700 dark:text-amber-300',
  success: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  primary: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300',
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm" @click="emit('cancel')" />
        <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-2xl w-full max-w-sm mx-auto p-6 border border-gray-100 dark:border-slate-700">
          <div class="flex items-start gap-3 mb-4">
            <div :class="['p-2 rounded-full flex-shrink-0', iconVariants[variant]]">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  v-if="variant === 'warning'"
                />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  v-if="variant === 'danger'"
                />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  v-if="variant === 'success' || variant === 'primary'"
                />
              </svg>
            </div>
            <div>
              <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">{{ title }}</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ message }}</p>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button
              @click="emit('cancel')"
              class="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-all duration-150"
            >
              {{ cancelLabel }}
            </button>
            <button
              @click="emit('confirm')"
              :disabled="loading"
              :class="['px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50', btnVariants[variant]]"
            >
              <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ loading ? 'Memproses...' : confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
