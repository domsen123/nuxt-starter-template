import sift from 'sift'
import type { AnyItem, ItemQuery, ItemStoreOptions, RefLike, SavedItem, StoredItem } from '~/types'
import { multiSort } from '~/utils/array'
import { ObjectKeys } from '~/utils/object'

export const useItems = <Item extends AnyItem>(options: ItemStoreOptions<Item>) => {
  type PrimaryKeyQuery = RefLike<Pick<Partial<SavedItem<Item>>, typeof primaryKeys[number]>>

  const internalColumns = ['_id', 'version', 'version_id', 'created_at', 'updated_at', 'created_by', 'updated_by']

  const {
    collectionName,
    primaryKey,
    // ttl = 10 * 1000, // 10 seconds in ms
  } = options

  const primaryKeys = (Array.isArray(primaryKey) ? primaryKey : [primaryKey]) as Array<keyof SavedItem<Item>>
  const { addError } = useErrorStore()

  const getRequestHash = (obj: any) => {
    return simpleHash(`${collectionName}/${JSON.stringify(obj)}`)
  }

  const toStoredItem = <T extends SavedItem<Item>>(item: T): StoredItem<T> => ({
    ...item,
    __stored_at: Date.now(),
    __collection: collectionName,
  })

  const useItemStore = defineStore(`items:${collectionName}`, () => {
    const items: Ref<Array<StoredItem<Item>>> = ref([])

    const getItemByPrimaryKey = (query: PrimaryKeyQuery) => computed(() => {
      const queryValue = unref(query)
      return items.value.find((item) => {
        return ObjectKeys(queryValue).every(key => item[key] === queryValue[key])
      })
    })

    const getItemsByFilter = (query: RefLike<ItemQuery<Item>>) => computed(() => {
      const q = unref(query)
      // @ts-expect-error TODO: fix this type error
      const filter = q.filter ? sift(q.filter) : () => true

      let result = items.value.filter(filter)

      if (q.sort) {
        // @ts-expect-error TODO: fix this type error
        result = multiSort(result, q.sort)
      }

      return result
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
      getItemsByFilter,
      setOneStateItem,
      setManyStateItems,
      removeOneStateItem,
      handleResult,
    }
  })

  const queryItems = (query: RefLike<ItemQuery<Item>>) => {
    const itemStore = useItemStore()
    const requestHash = computed(() => getRequestHash(unref(query)))

    const items = itemStore.getItemsByFilter(query)

    const _prepare = (q: typeof query) => useAsyncData<SavedItem<Item> | SavedItem<Item>[]>(
      requestHash.value,
      () => $fetch(`/api/items/${collectionName}/query`, {
        method: 'POST',
        body: JSON.stringify(unref(q)),
      }),
      {
        immediate: false,
        watch: [requestHash],
        dedupe: 'cancel',
      },
    )

    const { data, pending, status, execute, refresh, clear, error } = _prepare(query)
    watch(data, () => itemStore.handleResult({ data }), { deep: true })
    watch(error, error => error && addError(error), { deep: true })

    const result = { data, items, error, pending, status, execute, refresh, clear }
    const promise = execute()

    const resultPromise = Promise.resolve(promise).then(() => result)
    Object.assign(resultPromise, result)

    return resultPromise as typeof result & Promise<typeof result>
  }

  return {
    queryItems,
  }
}
