import type { AnyItem, ItemQuery, ItemStoreOptions, RefLike, SavedItem, StoredItem } from '~/types'
import { ObjectKeys } from '~/utils/object'

export const useItems = <Item extends AnyItem>(options: ItemStoreOptions<Item>) => {
  type PrimaryKeyQuery = RefLike<Pick<Partial<SavedItem<Item>>, typeof primaryKeys[number]>>

  const internalColumns = ['_id', 'version', 'version_id', 'created_at', 'updated_at', 'created_by', 'updated_by']

  const {
    collectionName,
    primaryKey,
    ttl = 10 * 1000, // 10 seconds in ms
  } = options

  const primaryKeys = (Array.isArray(primaryKey) ? primaryKey : [primaryKey]) as Array<keyof SavedItem<Item>>

  const { getRequest, addRequest, removeRequest, requestExists } = useRequestsStore()
  const { addError } = useErrorStore()

  const getRequestHash = (obj: any) => {
    return simpleHash(`${collectionName}/${JSON.stringify(obj)}`)
  }

  const toStoredItem = <T extends SavedItem<Item>>(item: T): StoredItem<T> => ({
    ...item,
    __stored_at: Date.now(),
  })

  const useItemStore = defineStore(`items:${collectionName}`, () => {
    const items: Ref<Array<StoredItem<Item>>> = ref([])

    const getItemByPrimaryKey = (query: PrimaryKeyQuery) => computed(() => {
      const queryValue = unref(query)
      return items.value.find((item) => {
        return ObjectKeys(queryValue).every(key => item[key] === queryValue[key])
      })
    })

    const mergeOneStateItem = (newItem: Partial<Item>, oldItem: SavedItem<Item>): SavedItem<Item> => {
      return ObjectKeys(omit(oldItem, internalColumns)).reduce((acc, key) => {
        acc[key] = newItem[key] ?? oldItem[key]
        return acc
      }, {} as SavedItem<Item>)
    }

    const setOneStateItem = (item: SavedItem<Item>) => {
      // @ts-expect-error TODO: fix this type error
      const existsAtIndex = items.value.findIndex(i => primaryKeys.every(key => i[key] === item[key]))
      if (existsAtIndex !== -1) {
        item = mergeOneStateItem(item, items.value[existsAtIndex])
        items.value.splice(existsAtIndex, 1, toStoredItem(item))
      }
      else {
        items.value.push(toStoredItem(item))
      }
    }

    const setManyStateItems = (items: SavedItem<Item>[]) => {
      items.forEach(setOneStateItem)
    }

    const removeOneStateItem = (item: SavedItem<Item>) => {
      // @ts-expect-error TODO: fix this type error
      const existsAtIndex = items.value.findIndex(i => primaryKeys.every(key => i[key] === item[key]))
      if (existsAtIndex !== -1)
        items.value.splice(existsAtIndex, 1)
    }

    const handleResult = ({ data }: { data: any }) => {
      if (Array.isArray(data.value))
        setManyStateItems(data.value)
      else
        setOneStateItem(data.value)
    }

    return {
      items,
      getItemByPrimaryKey,
      setOneStateItem,
      setManyStateItems,
      removeOneStateItem,
      handleResult,
    }
  })

  const queryItems = (query: RefLike<ItemQuery<Item>>) => {
    const itemStore = useItemStore()

    const requestHash = getRequestHash(unref(query))

    const loading = ref(true)
    const data: Ref<SavedItem<Item> | SavedItem<Item>[] | null> = ref(null)

    const execute = (q: typeof query): Promise<SavedItem<Item> | SavedItem<Item>[]> => {
      return new Promise((resolve) => {
        $fetch<SavedItem<Item> | SavedItem<Item>[]>(`/api/items/${collectionName}/query`, {
          method: 'POST',
          body: JSON.stringify(unref(q)),
        }).then((result) => {
          data.value = result
          Array.isArray(result) ? itemStore.setManyStateItems(result) : itemStore.setOneStateItem(result)
          resolve(data.value)
        }).catch(addError)
          .finally(() => loading.value = false)
      })
    }

    const dataPromise = requestExists(requestHash)
      ? getRequest<ReturnType<typeof execute>>(requestHash)
      : addRequest(requestHash, execute(query))

    removeRequest(requestHash)

    watch(query, execute, { deep: true })

    const result = { loading, data, refetch: () => execute(query) }

    const resultPromise = Promise.resolve(dataPromise).then(() => result)
    Object.assign(resultPromise, result)

    return resultPromise as typeof result & Promise<typeof result>
  }

  const getItem = (query: PrimaryKeyQuery) => {
    const itemStore = useItemStore()

    // creates a unique hash for the request based on the query
    const requestHash = getRequestHash(unref(query))

    const loading = ref(true)
    const data: Ref<SavedItem<Item> | null> = ref(null)
    const item = itemStore.getItemByPrimaryKey(query)

    const execute = (q: typeof query): Promise<SavedItem<Item>> => {
      return new Promise((resolve) => {
        if (item.value && (Date.now() - item.value.__stored_at) < ttl) {
          loading.value = false
          data.value = omit(item.value, ['__stored_at']) as SavedItem<Item>
          return resolve(data.value)
        }
        else {
          // @ts-expect-error TODO: fix this type error
          queryItems(ref({
            filter: {
              $and: ObjectEntries(unref(q)).map(([key, value]) => ({
                [key as keyof Item]: { $eq: value }, // as Filter<Item>[keyof Item],
              })),
            },
            singleton: true,
          }))
        }
      })
    }

    const dataPromise = requestExists(requestHash)
      ? getRequest<ReturnType<typeof execute>>(requestHash)
      : addRequest(requestHash, execute(query))

    // await dataPromise

    removeRequest(requestHash)

    watch(query, execute, { deep: true })

    const result = { item, loading, data, refetch: () => execute(query) }

    const resultPromise = Promise.resolve(dataPromise).then(() => result)
    Object.assign(resultPromise, result)

    return resultPromise as typeof result & Promise<typeof result>
  }
  // const getItems = async (queries: RefLike<PrimaryKeyQuery<Item, typeof options>>[]) => {}

  // const storeItem = async (item: Item) => {}
  // const storeItems = async (item: Item[]) => {}

  // const upsertItem = async (item: Item) => {}
  // const upsertItems = async (items: Item[]) => {}

  // const removeItem = async (item: Item) => {}
  // const removeItems = async (items: Item[]) => {}

  return {
    queryItems,
    getItem,
  }
}
