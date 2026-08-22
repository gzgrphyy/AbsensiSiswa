export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['nuxt-auth-utils', '@nuxtjs/tailwindcss', '@nuxtjs/color-mode', '@nuxtjs/i18n'],

  devServer: {
    host: '0.0.0.0',
    port: 3000
  },

  i18n: {
    defaultLocale: 'id',
    fallbackLocale: 'id',
    langDir: 'locales',
    locales: [
      { code: 'id', name: 'Indonesia', file: 'id.json' },
      { code: 'en', name: 'English', file: 'en.json' }
    ],
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'locale',
      alwaysRedirect: false
    }
  },

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
  },

  // --- Tambahkan blok konfigurasi ini ---
  vite: {
    server: {
      allowedHosts: true // Mengizinkan ngrok & host eksternal lainnya
    }
  }
})