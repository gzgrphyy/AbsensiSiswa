<script setup lang="ts">
withDefaults(defineProps<{
  padding?: 'sm' | 'md' | 'lg' | 'none'
  hover?: boolean
}>(), {
  padding: 'md',
  hover: false,
})

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}
</script>

<template>
  <div
    :class="[
      'bg-white rounded-lg border border-gray-200 shadow-card',
      paddings[padding],
      { 'hover:shadow-card-hover transition-shadow duration-200': hover }
    ]"
  >
    <slot />
  </div>
</template>
