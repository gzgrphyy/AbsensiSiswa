<script setup lang="ts">
import { inject } from 'vue'

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

const isAdmin = inject('isAdmin', false)

const iconBg = {
  primary: 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300',
  green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  amber: 'bg-accent-50 dark:bg-amber-900/30 text-primary-700 dark:text-amber-300',
  gray: 'bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300',
  purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
}

const adminIconBg = 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'

const cardStyle = {
  primary: 'bg-gradient-to-br from-primary-50/40 dark:from-primary-900/20 to-white dark:to-slate-800 border-primary-200 dark:border-primary-800 ring-1 ring-primary-100 dark:ring-primary-900/50',
  green: 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700',
  red: 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700',
  amber: 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700',
  gray: 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700',
  purple: 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700',
}
</script>

<template>
  <div v-if="isAdmin" class="rounded-none border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 p-3">
    <div class="flex items-center gap-3">
      <div v-if="$slots.icon" class="p-2 rounded-none bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 flex-shrink-0">
        <slot name="icon" />
      </div>
      <div class="min-w-0">
        <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold truncate">{{ label }}</p>
        <p class="text-base font-bold text-gray-900 dark:text-gray-100 mt-0.5">{{ value }}</p>
        <p v-if="trendLabel" class="text-[10px] mt-0.5 font-medium text-gray-400 dark:text-gray-500">{{ trendLabel }}</p>
      </div>
    </div>
  </div>
  <div v-else :class="['rounded-xl border shadow-card dark:shadow-dark-card p-5 transition-shadow duration-200 hover:shadow-md', cardStyle[variant]]">
    <div class="flex items-center gap-3">
      <div v-if="$slots.icon" :class="['p-2.5 rounded-lg flex-shrink-0', iconBg[variant]]">
        <slot name="icon" />
      </div>
      <div class="min-w-0">
        <p class="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold truncate">{{ label }}</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{{ value }}</p>
        <p v-if="trendLabel" class="text-xs mt-0.5 font-medium" :class="trend === 'up' ? 'text-green-600 dark:text-green-400' : trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'">{{ trendLabel }}</p>
      </div>
    </div>
  </div>
</template>
