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
        <div class="absolute inset-0 bg-black/30" @click="onBackdropClick" />
        <div :class="['relative bg-white rounded-xl shadow-xl border border-gray-200 w-full mx-auto', maxWidth]">
          <!-- Header -->
          <div v-if="title || $slots.header" class="flex items-center justify-between px-6 pt-6 pb-2">
            <h2 class="text-base font-semibold text-gray-900">{{ title }}</h2>
            <button
              @click="emit('close')"
              class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="px-6 py-4">
            <slot />
          </div>

          <div v-if="$slots.footer" class="flex justify-end gap-3 px-6 pb-6 pt-2 border-t border-gray-100">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
