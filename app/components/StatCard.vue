<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  value: string | number
  icon?: string
  variant?: 'primary' | 'green' | 'red' | 'amber' | 'gray' | 'purple'
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
}>(), {
  variant: 'primary',
})

const iconBg = {
  primary: 'bg-primary-100 text-primary-700',
  green: 'bg-green-50 text-green-600',
  red: 'bg-red-50 text-red-600',
  amber: 'bg-accent-50 text-primary-700',
  gray: 'bg-gray-50 text-gray-600',
  purple: 'bg-purple-50 text-purple-600',
}

const cardStyle = {
  primary: 'bg-gradient-to-br from-primary-50/40 to-white border-primary-200 ring-1 ring-primary-100',
  green: 'bg-white border-gray-100',
  red: 'bg-white border-gray-100',
  amber: 'bg-white border-gray-100',
  gray: 'bg-white border-gray-100',
  purple: 'bg-white border-gray-100',
}
</script>

<template>
  <div :class="['rounded-xl border shadow-card p-5 transition-shadow duration-200 hover:shadow-md', cardStyle[variant]]">
    <div class="flex items-center gap-3">
      <div v-if="$slots.icon" :class="['p-2.5 rounded-lg flex-shrink-0', iconBg[variant]]">
        <slot name="icon" />
      </div>
      <div class="min-w-0">
        <p class="text-[11px] text-gray-400 uppercase tracking-wider font-semibold truncate">{{ label }}</p>
        <p class="text-2xl font-bold text-gray-900 mt-0.5">{{ value }}</p>
        <p v-if="trendLabel" class="text-xs mt-0.5 font-medium" :class="trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-400'">
          {{ trendLabel }}
        </p>
      </div>
    </div>
  </div>
</template>
