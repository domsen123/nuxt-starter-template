declare module 'nuxt/schema' {
  interface RuntimeConfig {
    mongoUri: string
    mongoDatabase: string
  }
  interface PublicRuntimeConfig {

  }
}
// It is always important to ensure you import/export something when augmenting a type
export {}
