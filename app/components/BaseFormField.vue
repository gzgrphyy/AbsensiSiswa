<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  required?: boolean
  error?: string
  help?: string
  disabled?: boolean
}>(), {
  required: false,
  disabled: false,
})
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm  text-gray-600 dark:text-gray-400 mb-1.5">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <slot />
    <p v-if="help && !error" class="mt-1 text-xs text-gray-400 dark:text-gray-500">{{ help }}</p>
    <Transition name="fade">
      <p v-if="error" class="mt-1 text-xs text-red-600 flex items-center gap-1">
        <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ error }}
      </p>
    </Transition>
  </div>
</template>
