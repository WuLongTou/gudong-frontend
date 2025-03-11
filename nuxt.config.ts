// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  app: {
    baseURL: process.env.NUXT_PUBLIC_APP_BASEURL
  },
  devtools: {
    enabled: true,
    timeline: {
      enabled: true
    }
  },
  runtimeConfig: {
    public: {
      amapApiKey: process.env.NUXT_PUBLIC_AMAP_API_KEY,
      amapServiceSecurityCode: process.env.NUXT_PUBLIC_AMAP_SERVICE_SECURITY_CODE,
      amapServiceHost: process.env.NUXT_PUBLIC_AMAP_SERVICE_HOST,
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASEURL || '/'
    }
  },
  modules: ['@element-plus/nuxt']
})