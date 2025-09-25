import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxthub/core',
    'nuxt-security',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@vueuse/nuxt'
  ],
  pinia: {
    storesDirs: ['./app/stores/**.ts']
  },
  hub: {
    analytics: true,
    database: true,
  },
  nitro: {
    experimental: {
      tasks: true
    }
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss()
    ]
  },
})