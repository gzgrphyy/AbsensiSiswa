<script setup lang="ts">
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true

  try {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })

    const { fetch } = useUserSession()
    await fetch()

    const role = data.user?.role
    if (role === 'ADMIN') navigateTo('/admin', { replace: true })
    else if (role === 'GURU') navigateTo('/absensi', { replace: true })
    else if (role === 'SISWA') navigateTo('/siswa', { replace: true })
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.statusMessage || 'Login gagal'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <!-- Header dengan garis merah -->
      <div class="h-1 bg-red-600 rounded-t-lg" />

      <div class="bg-white rounded-b-lg border border-gray-200 border-t-0 shadow-card px-8 py-8">
        <!-- Logo & Title -->
        <div class="text-center mb-8">
          <div class="w-14 h-14 rounded-xl bg-red-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            S
          </div>
          <h1 class="text-lg font-bold text-gray-900">SISTEM ABSENSI SEKOLAH</h1>
          <p class="text-xs text-gray-400 mt-1">YAYASAN PENDIDIKAN INDONESIA</p>
        </div>

        <!-- Error -->
        <Transition name="fade">
          <div v-if="errorMsg" class="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ errorMsg }}</span>
          </div>
        </Transition>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              placeholder="email@sekolah.sch.id"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow placeholder:text-gray-400"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              placeholder="Masukkan password"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow placeholder:text-gray-400"
            />
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-medium rounded-lg transition-colors duration-150 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ loading ? 'Memproses...' : 'Masuk' }}
          </button>
        </form>

        <!-- Footer -->
        <p class="text-center text-xs text-gray-400 mt-6">
          &copy; {{ new Date().getFullYear() }} Yayasan Pendidikan Indonesia
        </p>
      </div>
    </div>
  </div>
</template>
