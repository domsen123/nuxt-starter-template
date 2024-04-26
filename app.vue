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

interface IUser {
  firstname: string
  lastname: string
  email: string
  password: string
  role: string
  city: string
  country: string
  postalCode: string
  address: string
  phone: string
}

const itemStore = useItems<IUser>({
  collectionName: '_test_',
  primaryKey: 'email',
})
const q = ref({ id: 123 })

const increment = () => {
  q.value.id++
}

const decrement = () => {
  q.value.id--
}
</script>

<template>
  <div>
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <div>
        Query:
        <pre>{{ q }}</pre>
        Item:
        <pre>{{ { data, item, loading } }}</pre>

        <div class="flex gap-2">
          <UButton @click="increment">
            increment
          </UButton>
          <UButton @click="decrement">
            decrement
          </UButton>
        </div>
      </div>
      <NuxtPage />
    </NuxtLayout>

    <UNotifications />
    <UModals />
  </div>
</template>
