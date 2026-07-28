<script setup lang="ts">
const { pengaturan } = usePengaturan()
</script>

<template>
  <div class="bg-white dark:bg-slate-800 border-b-2 border-gray-300 dark:border-gray-600 px-4 py-3 mb-3">
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 flex-shrink-0 overflow-hidden">
        <img v-if="pengaturan?.iconPath" :src="pengaturan.iconPath" class="w-full h-full object-contain" />
        <div v-else class="w-12 h-12 bg-blue-600 flex items-center justify-center text-white text-lg font-bold">{{ pengaturan?.namaAplikasi?.charAt(0) || 'S' }}</div>
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-base font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">{{ pengaturan?.namaAplikasi || 'SMKN 4 BANDUNG' }}</h1>
        <p class="text-xs text-gray-500 dark:text-gray-400">{{ pengaturan?.titelAplikasi || 'SISTEM ABSENSI SISWA' }}</p>
      </div>
      <div class="text-right text-[10px] text-gray-400 dark:text-gray-500 hidden sm:block">
        <p>Terintegrasi & Aman</p>
        <p class="font-mono">v1.0</p>
      </div>
    </div>
  </div>
</template>
