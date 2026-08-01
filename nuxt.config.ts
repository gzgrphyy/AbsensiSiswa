export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  devServer: {
    host: '0.0.0.0',
    port: 3000
  },

  modules: ['nuxt-auth-utils', '@nuxtjs/tailwindcss', '@nuxtjs/color-mode'],

  components: [{ path: '~/components', pathPrefix: false }],

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    session: {
      cookie: {
        secure: false // Biar cookie bisa diterima via HTTP (HP akses via IP)
      }
    }
  },

  nitro: {
    experimental: {
      openAPI: false
    }
  }
})