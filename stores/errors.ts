export const useErrorStore = defineStore('errors', () => {
  const errors = ref<{ message?: string, ts: number }[]>([])

  const addError = (error: Error) => {
    errors.value.unshift({
      message: error.message ?? 'Unknown error',
      ts: Date.now(),
    })
  }

  return {
    errors,
    addError,
  }
})
