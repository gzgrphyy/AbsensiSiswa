<script setup lang="ts">

const { user, clear } = useUserSession()

async function handleLogout() {
  try { await clear() } catch {}
  navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/60 sticky top-0 z-30">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {{ user?.nama?.charAt(0)?.toUpperCase() || 'S' }}
          </div>
          <div>
            <h1 class="text-lg font-semibold text-gray-900">Dashboard Siswa</h1>
            <p class="text-sm text-gray-500">Selamat datang, {{ user?.nama }}</p>
          </div>
        </div>
        <button @click="handleLogout"
          class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Status Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6 hover:shadow-md transition-shadow duration-200">
        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 bg-blue-100 rounded-xl">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Status Absensi Hari Ini</h2>
            <p class="text-sm text-gray-500">Belum ada sesi absensi aktif</p>
          </div>
        </div>

        <div class="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <p class="text-gray-500 font-medium">Scan QR Ruangan untuk Absensi</p>
          <p class="text-sm text-gray-400 mt-1">Arahkan kamera ke QR code yang ada di ruangan kelas</p>
        </div>
      </div>

      <!-- Quick Info Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-green-100 rounded-lg">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Hadir</p>
              <p class="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-amber-200 transition-all duration-200">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-amber-100 rounded-lg">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Menunggu</p>
              <p class="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-purple-200 transition-all duration-200">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-purple-100 rounded-lg">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">Riwayat</p>
              <p class="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent History -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-semibold text-gray-900">Riwayat Absensi Terbaru</h3>
          <span class="text-xs text-gray-400">Kosong</span>
        </div>
        <div class="p-10 flex flex-col items-center justify-center text-center">
          <svg class="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-gray-500 font-medium">Belum ada riwayat absensi</p>
          <p class="text-sm text-gray-400 mt-1">Riwayat akan muncul setelah kamu melakukan absensi</p>
        </div>
      </div>
    </main>
  </div>
</template>
