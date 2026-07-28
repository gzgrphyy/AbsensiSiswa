<script setup lang="ts">
const route = useRoute()

const activeMenu = computed(() => {
  const path = route.path
  if (path === '/admin') return 'Dasbor'
  if (path.startsWith('/admin/guru') || path.startsWith('/admin/siswa') || path.startsWith('/admin/kelas') || path.startsWith('/admin/tahun-ajaran') || path.startsWith('/admin/ruangan') || path.startsWith('/admin/jadwal-pelajaran')) return 'Data Master'
  if (path.startsWith('/admin/monitoring')) return 'Pemantauan'
  if (path.startsWith('/admin/rekap') || path.startsWith('/admin/export')) return 'Laporan'
  if (path.startsWith('/admin/pengaturan')) return 'Pengaturan'
  return ''
})

const subMenus: Record<string, { label: string; to: string }[]> = {
  'Data Master': [
    { label: 'Data Guru', to: '/admin/guru' },
    { label: 'Data Siswa', to: '/admin/siswa' },
    { label: 'Data Kelas', to: '/admin/kelas' },
    { label: 'Tahun Ajaran', to: '/admin/tahun-ajaran' },
    { label: 'Data Ruangan', to: '/admin/ruangan' },
    { label: 'Jadwal Pelajaran', to: '/admin/jadwal-pelajaran' },
  ],
  'Laporan': [
    { label: 'Rekap Absensi', to: '/admin/rekap' },
    { label: 'Export Laporan', to: '/admin/export' },
  ],
}

const currentSubMenus = computed(() => subMenus[activeMenu.value] || [])

const isActive = (to: string) => route.path === to
</script>

<template>
  <div
    v-if="currentSubMenus.length > 0"
    class="bg-white border-b border-gray-200 flex-shrink-0 overflow-x-auto scrollbar-thin"
  >
    <div class="px-4 sm:px-6 h-9 flex items-center gap-1 min-w-max">
      <NuxtLink
        v-for="item in currentSubMenus"
        :key="item.to"
        :to="item.to"
        :class="[
          'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
          isActive(item.to)
            ? 'bg-primary-500 text-white shadow-sm'
            : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
        ]"
      >
        {{ item.label }}
      </NuxtLink>
    </div>
  </div>
</template>