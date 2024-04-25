import { defineStore } from 'pinia'
import type { ExecutingRequest } from '~/types/request'

export const useRequestsStore = defineStore('requests', () => {
  const requests = ref<ExecutingRequest[]>([])

  /* Add a request to the store and return the promise
   * @param key - The key to identify the request
   * @param promise - The promise to add
   */
  const addRequest = <T = Promise<any>>(key: string, promise: Promise<T>) => {
    const existsAtIndex = requests.value.findIndex(r => r.key === key)
    if (existsAtIndex === -1)
      requests.value.push({ key, promise })

    return promise
  }

  /* Get a request from the store
   * @param key - The key to identify the request
   */
  const getRequest = <T = Promise<any>>(key: string): T => {
    return requests.value.find(r => r.key === key)?.promise as T
  }

  /* Remove a request from the store
   * @param key - The key to identify the request
   */
  const removeRequest = (key: string) => {
    const existsAtIndex = requests.value.findIndex(r => r.key === key)
    if (existsAtIndex !== -1)
      requests.value.splice(existsAtIndex, 1)
  }

  /* Check if a request exists in the store
   * @param key - The key to identify the request
   */
  const requestExists = (key: string): boolean => {
    return !!requests.value.find(r => r.key === key)
  }

  return {
    requests,
    addRequest,
    getRequest,
    removeRequest,
    requestExists,
  }
})
