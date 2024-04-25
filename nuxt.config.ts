// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [process.env.NUXT_UI_PRO_PATH || '@nuxt/ui-pro'],
  modules: [
    '@nuxt/ui',
    '@nuxt/fonts',
    '@vueuse/nuxt',
    '@pinia/nuxt',
  ],
  ui: {
    icons: ['heroicons', 'simple-icons'],
  },
  devtools: {
    enabled: true,
  },
})
