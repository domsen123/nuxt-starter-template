<script setup lang="ts">
const appConfig = useAppConfig()
const colorMode = useColorMode()
const color = computed(() => colorMode.value === 'dark' ? '#111827' : 'white')

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color },
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
  ],
  htmlAttrs: {
    lang: 'en',
  },
})

useSeoMeta({
  title: `%s - ${appConfig.seo.title}`,
  description: appConfig.seo.description,
  ogTitle: `%s - ${appConfig.seo.title}`,
  ogDescription: appConfig.seo.description,
  ogImage: 'https://dashboard-template.nuxt.dev/social-card.png',
  twitterImage: 'https://dashboard-template.nuxt.dev/social-card.png',
  twitterCard: 'summary_large_image',
})

const itemStore = useItems({
  collectionName: '_test_',
  primaryKey: 'id',
  ttl: 200,
})
const q = ref({ id: 123 })

const { data } = itemStore.getItem(q)

watch(() => q.value, (newQ) => {
  console.log('watch from component', newQ)
})
onMounted(() => {
  setInterval(() => {
    q.value.id = q.value.id + 1
    console.log('updating', q.value)
  }, 1000)
})
</script>

<template>
  <div>
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <pre>{{ data }}</pre>
      <NuxtPage />
    </NuxtLayout>

    <UNotifications />
    <UModals />
  </div>
</template>
