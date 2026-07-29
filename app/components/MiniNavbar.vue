<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const { pengaturan } = usePengaturan()
const colorMode = useColorMode()
const isAdmin = inject('isAdmin', false)

const showProfile = ref(false)

const isDark = computed(() => colorMode.value === 'dark')

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const dev = {
  nama: 'Geza Nurhalim Irfansyah Putra',
  role: 'Pengembang Aplikasi',
  email: 'gezanurhalimm@gmail.com',
  telepon: '0857-2235-5108',
  github: 'github.com/gzgrphyy',
  instagram: '@gzgrphy',
  website: 'gzgrphy.framer.website',
  foto: '/photo/profile_geza.jpg'
}

function toggleProfile() {
  showProfile.value = !showProfile.value
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('#profile-dropdown')) {
    showProfile.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 flex-shrink-0 relative z-50">
    <div class="px-3 sm:px-4 flex items-center justify-between h-[26px]">
      <!-- Left: Logo & App Name -->
      <NuxtLink to="/admin" class="flex items-center gap-1.5 min-w-0">
        <div :class="['w-4 h-4 bg-primary-500 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 overflow-hidden', isAdmin ? 'rounded-none' : 'rounded']">
          <img v-if="pengaturan?.iconPath" :src="pengaturan.iconPath" class="w-full h-full object-contain" />
          <span v-else>{{ pengaturan?.namaAplikasi?.charAt(0) || 'S' }}</span>
        </div>
        <span class="text-[10px] font-medium text-gray-600 dark:text-gray-400 truncate hidden sm:inline">{{ pengaturan?.namaAplikasi || 'Aplikasi Skoria' }}</span>
      </NuxtLink>

      <!-- Right: Dark Mode Toggle + Developer Profile -->
      <div class="flex items-center gap-1.5">
        <!-- Theme Toggle -->
        <button
          @click="toggleColorMode"
          :class="['w-4 h-4 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors', isAdmin ? 'rounded-none' : 'rounded']"
          :title="isDark ? 'Mode Terang' : 'Mode Gelap'"
        >
          <!-- Sun icon (show in dark mode) -->
          <svg v-if="isDark" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <!-- Moon icon (show in light mode) -->
          <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <img src="/bendera_indonesia.png" class="w-4 h-3 object-contain flex-shrink-0" alt="Merdeka" />

        <!-- Developer Profile -->
        <button
          id="profile-dropdown"
          @click.stop="toggleProfile"
          class="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center"
          title="Pengembang"
        >
          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="showProfile" :class="['fixed top-8 right-3 sm:right-4 w-72 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 z-[100]', isAdmin ? 'rounded-none shadow' : 'rounded shadow-lg']" @click.stop>
      <div class="p-4">
        <div class="flex items-center gap-3 mb-3">
          <div v-if="dev.foto" class="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden">
            <img :src="dev.foto" class="w-full h-full object-cover" />
          </div>
          <div v-else :class="['w-10 h-10 bg-primary-500 flex items-center justify-center text-white font-bold flex-shrink-0', isAdmin ? 'rounded-none' : 'rounded-full']">
            {{ dev.nama.charAt(0) }}
          </div>
          <div>
        <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ dev.nama }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">{{ dev.role }}</p>
          </div>
        </div>

        <div class="border-t border-gray-100 dark:border-slate-700 pt-3 space-y-2 text-sm">
          <a :href="'mailto:' + dev.email" class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {{ dev.email }}
          </a>
          <a :href="'tel:' + dev.telepon" class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {{ dev.telepon }}
          </a>
          <a :href="'https://' + dev.github" target="_blank" class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
            <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            {{ dev.github }}
          </a>
          <a :href="'https://' + dev.website" target="_blank" class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            {{ dev.website }}
          </a>
          <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <img src="/logo_instagram.png" class="w-4 h-4 flex-shrink-0 object-contain [filter:brightness(0)_saturate(100%)_invert(40%)] dark:[filter:brightness(0)_saturate(100%)_invert(70%)]" alt="Instagram" />
            <a :href="'https://instagram.com/' + dev.instagram.replace('@', '')" target="_blank" class="hover:text-primary-600 dark:hover:text-primary-400">{{ dev.instagram }}</a>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
