<script setup lang="ts">
interface JadwalItem {
  id: number
  mapel: string
  hari: string
  jamMulai: string
  jamSelesai: string
  ruangan: { id: number; nama: string }
  guru: { id: number; nama: string }
}

interface JadwalData {
  kelas: { id: number; nama: string }
  hariOrder: string[]
  grouped: Record<string, JadwalItem[]>
}

const { data, pending } = useFetch<JadwalData>('/api/siswa/jadwal', { immediate: true })

const hariLabel: Record<string, string> = {
  SENIN: 'Senin', SELASA: 'Selasa', RABU: 'Rabu',
  KAMIS: 'Kamis', JUMAT: 'Jumat', SABTU: 'Sabtu', MINGGU: 'Minggu'
}

const todayHari = computed(() => {
  const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU']
  return days[new Date().getDay()]
})

const activeDay = ref('')

function toggleDay(hari: string) {
  activeDay.value = activeDay.value === hari ? '' : hari
}

onMounted(() => {
  if (data.value?.grouped) {
    if (data.value.grouped[todayHari.value]) {
      activeDay.value = todayHari.value
    } else {
      activeDay.value = data.value.hariOrder.find(h => data.value!.grouped[h]) || ''
    }
  }
})
</script>

<template>
  <StudentLayout>
    <PageHeader title="Jadwal Pelajaran" :description="data?.kelas?.nama ? `Kelas ${data.kelas.nama}` : undefined" :show-back="false" />

    <LoadingSkeleton v-if="pending" type="text" :rows="8" />

    <template v-else-if="data && Object.keys(data.grouped).length > 0">
      <div class="space-y-3">
        <div v-for="hari in data.hariOrder" :key="hari">
          <div v-if="data.grouped[hari]" class="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-card dark:shadow-dark-card overflow-hidden">
            <button @click="toggleDay(hari)"
              class="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50"
              :class="{
                'border-b border-gray-100 dark:border-slate-700': activeDay === hari,
                'bg-primary-50 dark:bg-primary-900/20': hari === todayHari
              }">
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 rounded-full" :class="hari === todayHari ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'"></div>
                <span class="font-semibold text-gray-900 dark:text-gray-100 w-16 shrink-0">{{ hariLabel[hari] || hari }}</span>
                <span class="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{{ data.grouped[hari].length }} mapel</span>
              </div>
              <svg class="w-4 h-4 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': activeDay === hari }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div v-show="activeDay === hari" class="divide-y divide-gray-50 dark:divide-slate-700/50">
              <div v-for="item in data.grouped[hari]" :key="item.id"
                class="px-5 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <div class="flex items-start gap-4 min-w-0">
                  <div class="text-center flex-shrink-0 w-14">
                    <p class="text-xs font-bold text-gray-900 dark:text-gray-100">{{ item.jamMulai }}</p>
                    <p class="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">{{ item.jamSelesai }}</p>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ item.mapel }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ item.ruangan.nama }} &middot; {{ item.guru.nama }}</p>
                  </div>
                </div>
                <BaseBadge variant="primary" size="sm" class="flex-shrink-0 ml-2">{{ item.ruangan.nama }}</BaseBadge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-card dark:shadow-dark-card">
      <div class="flex flex-col items-center py-16 px-4">
        <svg class="w-12 h-12 text-gray-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-gray-500 dark:text-gray-400 font-medium">Belum ada jadwal pelajaran</p>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Hubungi admin untuk mengatur jadwal kelas</p>
      </div>
    </div>
  </StudentLayout>
</template>
