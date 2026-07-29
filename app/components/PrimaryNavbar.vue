<script setup lang="ts">
const route = useRoute()
const { user, clear } = useUserSession()
const { pengaturan } = usePengaturan()

const today = new Date().toLocaleDateString('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

const roleLabel: Record<string, string> = {
  ADMIN: 'Administrator',
}

interface PrimaryMenuItem {
  label: string
  to?: string
  icon: string
  hasSub: boolean
}

const primaryMenus: PrimaryMenuItem[] = [
  { label: 'Dasbor', to: '/admin', icon: 'dashboard', hasSub: false },
  { label: 'Data Master', icon: 'master-data', hasSub: true },
  { label: 'Pemantauan', to: '/admin/monitoring', icon: 'monitor', hasSub: false },
  { label: 'Laporan', icon: 'laporan', hasSub: true },
  { label: 'Profil', to: '/admin/profil', icon: 'profile', hasSub: false },
  { label: 'Pengaturan', to: '/admin/pengaturan', icon: 'settings', hasSub: false },
]

const menuRouteMap: Record<string, string> = {
  'Data Master': '/admin/guru',
  'Laporan': '/admin/rekap',
}

const activeMenu = computed(() => {
  const path = route.path
  if (path === '/admin') return 'Dasbor'
  if (path.startsWith('/admin/guru') || path.startsWith('/admin/siswa') || path.startsWith('/admin/kelas') || path.startsWith('/admin/tahun-ajaran') || path.startsWith('/admin/ruangan') || path.startsWith('/admin/jadwal-pelajaran')) return 'Data Master'
  if (path.startsWith('/admin/monitoring')) return 'Pemantauan'
  if (path.startsWith('/admin/rekap') || path.startsWith('/admin/export')) return 'Laporan'
  if (path.startsWith('/admin/pengaturan')) return 'Pengaturan'
  if (path.startsWith('/admin/profil')) return 'Profil'
  return ''
})

function handleMenuClick(menu: PrimaryMenuItem) {
  if (menu.to) {
    navigateTo(menu.to)
  } else if (menu.hasSub && menuRouteMap[menu.label]) {
    navigateTo(menuRouteMap[menu.label])
  }
}

async function handleLogout() {
  try { await clear() } catch {}
  navigateTo('/login')
}

function renderIcon(icon: string) {
  const icons: Record<string, string> = {
    dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    'master-data': 'M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16M9 11h6',
    monitor: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    laporan: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    profile: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  }
  return icons[icon] || icons.dashboard
}
</script>

<template>
  <header class="bg-[#212529] flex-shrink-0 sticky top-0 z-50">
    <div class="h-0.5 bg-primary-500" />

    <div class="px-4 sm:px-6">
      <div class="flex items-center justify-between h-[74px]">
        <!-- Logo -->
        <NuxtLink to="/admin" class="flex items-center gap-3 flex-shrink-0">
          <div class="w-10 h-10 bg-primary-500 flex items-center justify-center text-white text-base font-bold overflow-hidden">
            <img v-if="pengaturan?.iconPath" :src="pengaturan.iconPath" class="w-full h-full object-contain p-1" />
            <span v-else>S</span>
          </div>
          <div class="hidden sm:block min-w-0">
            <p class="text-base font-semibold text-gray-100 truncate leading-tight">{{ pengaturan?.namaAplikasi || 'SMKN 4 Bandung' }}</p>
            <p class="text-[11px] text-gray-400 truncate leading-tight">{{ pengaturan?.titelAplikasi || 'Sistem Absensi' }}</p>
          </div>
        </NuxtLink>

        <!-- Primary Menu -->
        <nav class="hidden md:flex items-center gap-1.5">
          <button
            v-for="menu in primaryMenus"
            :key="menu.label"
            @click="handleMenuClick(menu)"
            :class="[
              'inline-flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-all duration-150',
              activeMenu === menu.label
                ? 'bg-primary-500/20 text-primary-300'
                : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="renderIcon(menu.icon)" />
            </svg>
            <span>{{ menu.label }}</span>
          </button>
        </nav>

        <!-- Right: User Info -->
        <div class="flex items-center gap-4">
          <span class="text-xs text-gray-400 hidden lg:block">{{ today }}</span>
          <div class="h-5 w-px bg-gray-600 hidden lg:block" />

          <div class="flex items-center gap-2.5">
            <div v-if="user?.foto" class="w-8 h-8 rounded-full overflow-hidden border border-primary-400">
              <img :src="user.foto" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-semibold text-white border border-primary-400">
              {{ user?.nama?.charAt(0)?.toUpperCase() || 'U' }}
            </div>
            <div class="hidden lg:block">
              <p class="text-sm font-medium text-gray-100 leading-tight">{{ user?.nama || 'Pengguna' }}</p>
              <p class="text-[11px] text-gray-400 leading-tight">{{ roleLabel[user?.role] || user?.role }}</p>
            </div>
          </div>

          <button
            @click="handleLogout"
            class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-400 hover:text-primary-300 hover:bg-white/10 transition-all duration-150"
            title="Keluar"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>