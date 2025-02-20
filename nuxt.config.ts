// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: {
    enabled: true,
    timeline: {
      enabled: true
    }
  },
  modules: ['@element-plus/nuxt', '@nuxtjs/tailwindcss'],
  runtimeConfig: {
    public: {
      amapApiKey: process.env.NUXT_PUBLIC_AMAP_API_KEY,
      amapSecretKey: process.env.NUXT_PUBLIC_AMAP_SECRET_KEY
    }
  }
})