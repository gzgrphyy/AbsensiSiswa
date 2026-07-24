<template>
  <div class="dashboard">
    <h1>Dashboard Guru</h1>
    <p>Selamat datang, {{ user?.nama }}</p>
    <button @click="handleLogout">Logout</button>
  </div>
</template>

<script setup lang="ts">
const { user, clear } = useUserSession()

async function handleLogout() {
  try {
    await clear()
  } catch {
    // proceed regardless
  }
  navigateTo('/login')
}
</script>

<style>
.dashboard {
  padding: 2rem;
  font-family: system-ui, sans-serif;
}
button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
