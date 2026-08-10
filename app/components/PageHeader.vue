<script setup lang="ts">
import { inject } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  description?: string
  showBack?: boolean
  backTo?: string
}>(), {
  showBack: true,
})

const isAdmin = inject('isAdmin', false)

function goBack() {
  if (history.length > 1) {
    history.back()
  } else {
    navigateTo(props.backTo || '/admin')
  }
}
</script>

<template>
  <div :class="[isAdmin ? 'mb-3' : 'mb-6', 'flex items-center justify-between']">
    <div class="flex items-center gap-3">
      <button v-if="showBack" @click="goBack"
        :class="[isAdmin ? 'p-1 rounded-none text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700' : 'p-1.5 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg', 'transition-all duration-150']"
        title="Kembali">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      </button>
      <div>
        <h1 :class="[isAdmin ? 'text-base ' : 'text-xl  tracking-tight', 'text-gray-900 dark:text-gray-100']">{{ title }}</h1>
        <p v-if="description" :class="[isAdmin ? 'text-xs' : 'text-sm', 'text-gray-400 dark:text-gray-500 mt-0.5']">{{ description }}</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
