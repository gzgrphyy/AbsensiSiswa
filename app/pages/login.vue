<template>
  <div class="login-page">
    <form @submit.prevent="handleLogin" class="login-form">
      <h1>Login Absensi Siswa</h1>

      <div v-if="errorMsg" class="error">{{ errorMsg }}</div>

      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" placeholder="email@absensi.test" required />
      </div>

      <div class="field">
        <label for="password">Password</label>
        <input id="password" v-model="password" type="password" placeholder="Password" required />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Memproses...' : 'Login' }}
      </button>
    </form>
  </div>
</template>

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

    // Sync session state client-side
    const { fetch } = useUserSession()
    await fetch()

    // Redirect sesuai role — pake replace biar ga bisa back ke halaman login
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

<style>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: system-ui, sans-serif;
  background: #f5f5f5;
}
.login-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 360px;
}
.login-form h1 {
  margin: 0 0 1.5rem;
  font-size: 1.25rem;
  text-align: center;
}
.field {
  margin-bottom: 1rem;
}
.field label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: #333;
}
.field input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}
button {
  width: 100%;
  padding: 0.625rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.error {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  text-align: center;
}
</style>
