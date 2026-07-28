<script setup lang="ts">
withDefaults(defineProps<{
  show: boolean
  title?: string
  maxWidth?: string
  closeOnBackdrop?: boolean
}>(), {
  maxWidth: 'max-w-md',
  closeOnBackdrop: true,
})

const emit = defineEmits<{
  close: []
}>()

function onBackdropClick() {
  if (closeOnBackdrop) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="onBackdropClick">
        <div class="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm" @click="onBackdropClick" />
        <div :class="['relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-slate-700 w-full mx-auto', maxWidth]">
          <!-- Header -->
          <div v-if="title || $slots.header" class="flex items-center justify-between px-6 pt-6 pb-2">
            <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">{{ title }}</h2>
            <button
              @click="emit('close')"
              class="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-150"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="px-6 py-4">
            <slot />
          </div>

          <div v-if="$slots.footer" class="flex justify-end gap-3 px-6 pb-6 pt-4 border-t border-gray-50 dark:border-slate-700">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
