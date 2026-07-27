<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  value: string | number
  icon?: string
  variant?: 'blue' | 'green' | 'red' | 'amber' | 'gray' | 'purple'
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
}>(), {
  variant: 'blue',
})

const iconBg = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
  amber: 'bg-amber-100 text-amber-600',
  gray: 'bg-gray-100 text-gray-600',
  purple: 'bg-purple-100 text-purple-600',
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-card p-5">
    <div class="flex items-center gap-3">
      <div v-if="$slots.icon" :class="['p-2.5 rounded-lg flex-shrink-0', iconBg[variant]]">
        <slot name="icon" />
      </div>
      <div class="min-w-0">
        <p class="text-xs text-gray-500 uppercase tracking-wider font-medium truncate">{{ label }}</p>
        <p class="text-xl font-bold text-gray-900 mt-0.5">{{ value }}</p>
        <p v-if="trendLabel" class="text-xs mt-0.5" :class="trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-400'">
          {{ trendLabel }}
        </p>
      </div>
    </div>
  </div>
</template>
