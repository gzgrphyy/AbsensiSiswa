<script setup lang="ts">
const { user, clear } = useUserSession()

async function handleLogout() {
  try { await clear() } catch {}
  navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-900">Dashboard Admin</h1>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-600">{{ user?.nama }}</span>
          <button @click="handleLogout" class="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink to="/admin/tahun-ajaran"
          class="block p-6 bg-white rounded-xl shadow-sm border hover:shadow-md hover:border-blue-300 transition-all">
          <h2 class="font-semibold text-gray-900">Tahun Ajaran</h2>
          <p class="text-sm text-gray-500 mt-1">Kelola tahun ajaran dan semester</p>
        </NuxtLink>

        <div class="block p-6 bg-white rounded-xl shadow-sm border opacity-50">
          <h2 class="font-semibold text-gray-400">Kelas</h2>
          <p class="text-sm text-gray-400 mt-1">(Coming soon)</p>
        </div>

        <div class="block p-6 bg-white rounded-xl shadow-sm border opacity-50">
          <h2 class="font-semibold text-gray-400">Siswa</h2>
          <p class="text-sm text-gray-400 mt-1">(Coming soon)</p>
        </div>

        <NuxtLink to="/admin/guru"
          class="block p-6 bg-white rounded-xl shadow-sm border hover:shadow-md hover:border-blue-300 transition-all">
          <h2 class="font-semibold text-gray-900">Guru</h2>
          <p class="text-sm text-gray-500 mt-1">Kelola akun guru dan hak akses</p>
        </NuxtLink>
      </div>
    </main>
  </div>
</template>
