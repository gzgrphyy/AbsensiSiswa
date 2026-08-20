<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

  interface Option {
    id: number
    text: string
  }

  const props = withDefaults(defineProps<{
    modelValue: number | null
    options: Option[]
    placeholder?: string
    disabled?: boolean
  }>(), {
    placeholder: '',
    disabled: false,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: number]
    change: []
  }>()

  const open = ref(false)
  const search = ref('')
  const root = ref<HTMLElement | null>(null)
  const searchInput = ref<HTMLInputElement | null>(null)

  const selected = computed(() => props.options.find(o => o.id === props.modelValue))

  const filteredOptions = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return props.options
    return props.options.filter(o => o.text.toLowerCase().includes(q))
  })

  function toggle() {
    if (props.disabled) return
    open.value = !open.value
    if (open.value) {
      search.value = ''
      setTimeout(() => searchInput.value?.focus(), 0)
    }
  }

  function select(option: Option) {
    emit('update:modelValue', option.id)
    emit('change')
    open.value = false
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') open.value = false
  }

  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (root.value && !root.value.contains(target)) {
      open.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleKeydown)
  })
</script>

<template>
  <div ref="root" class="relative">
    <button type="button" :disabled="disabled" @click="toggle"
      class="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 border border-gray-300 rounded-lg text-xs bg-white text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
      <span :class="selected ? 'text-gray-900' : 'text-gray-400'">{{ selected ? selected.text : placeholder }}</span>
      <svg class="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform" :class="{ 'rotate-180': open }" fill="none"
        stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-if="open"
      class="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
      <div class="p-2 border-b border-gray-100 dark:border-slate-700">
        <input ref="searchInput" v-model="search" type="text"
          class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
          placeholder="Cari..." @click.stop />
      </div>
      <ul class="max-h-48 overflow-y-auto scrollbar-thin py-1">
        <li v-for="option in filteredOptions" :key="option.id">
          <button type="button" @click="select(option)"
            class="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            :class="{ 'bg-blue-50 dark:bg-blue-900/30 font-medium': option.id === modelValue }">
            {{ option.text }}
          </button>
        </li>
        <li v-if="filteredOptions.length === 0">
          <p class="px-3 py-4 text-center text-xs text-gray-400">Tidak ada hasil</p>
        </li>
      </ul>
    </div>
  </div>
</template>