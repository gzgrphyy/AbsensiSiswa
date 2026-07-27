<script setup lang="ts">
// Root path — langsung redirect ke login.
// Auth middleware akan handle redirect lebih lanjut kalau user sudah login.
navigateTo('/login', { replace: true })
</script>

<template>
  <div></div>
</template>
