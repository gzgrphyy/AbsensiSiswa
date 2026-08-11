<script setup lang="ts">
import { inject } from 'vue'

const isAdmin = inject('isAdmin', false)

const props = withDefaults(defineProps<{
  label: string
  accept?: string
  currentPath?: string | null
}>(), {
  accept: 'image/*',
  currentPath: null,
})

const emit = defineEmits<{
  uploaded: [path: string]
  deleted: []
}>()

const fileName = ref('')
const uploading = ref(false)
const previewUrl = computed(() => {
  if (props.currentPath) return props.currentPath
  return null
})

const fileInput = ref<HTMLInputElement>()

function handleClick() {
  fileInput.value?.click()
}

const deleting = ref(false)

async function handleDelete() {
  if (!props.currentPath) return
  deleting.value = true
  try {
    await $fetch('/api/admin/upload', {
      method: 'DELETE',
      body: { filePath: props.currentPath },
    })
    emit('deleted')
  } catch {
    // silent
  } finally {
    deleting.value = false
  }
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  fileName.value = file.name
  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', props.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, ''))

    const res = await $fetch<{ success: boolean; path: string }>('/api/admin/upload', {
      method: 'POST',
      body: formData,
    })

    if (res.success) {
      emit('uploaded', res.path)
    }
  } catch {
    fileName.value = 'Upload gagal'
  } finally {
    uploading.value = false
    input.value = ''
  }
}
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">{{ label }}</label>
    <div class="flex items-center gap-3">
      <input ref="fileInput" type="file" :accept="accept" class="hidden" @change="handleFileChange" />
      <button
        type="button"
        :disabled="uploading"
        :class="['px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2', isAdmin ? 'rounded-lg' : 'rounded-lg']"
        @click="handleClick"
      >
        <svg v-if="uploading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Pilih File
      </button>

      <span v-if="fileName && !previewUrl" class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{{ fileName }}</span>
      <span v-else-if="!currentPath" class="text-sm text-gray-400 dark:text-gray-500 italic">Belum ada file dipilih</span>

      <div v-if="previewUrl" class="flex items-center gap-2">
        <img :src="previewUrl" alt="Preview" :class="['w-8 h-8 object-contain border border-gray-200 dark:border-slate-600', isAdmin ? 'rounded-lg' : 'rounded']" />
        <span class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{{ currentPath?.split('/').pop() }}</span>
        <button
          type="button"
          :disabled="deleting"
          :class="['p-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50', isAdmin ? 'rounded-lg' : 'rounded-lg']"
          title="Hapus file"
          @click="handleDelete"
        >
          <svg v-if="deleting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
