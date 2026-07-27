<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  showBack?: boolean
  backTo?: string
}>(), {
  showBack: true,
})

function goBack() {
  if (history.length > 1) {
    history.back()
  } else {
    navigateTo('/admin')
  }
}
</script>

<template>
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-3">
      <button
        v-if="showBack"
        @click="goBack"
        class="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-150"
        title="Kembali"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
      <div>
        <h1 class="text-xl font-bold text-gray-900 tracking-tight">{{ title }}</h1>
        <p v-if="description" class="text-sm text-gray-400 mt-0.5">{{ description }}</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
