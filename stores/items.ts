import type { RefLike } from '~/types/helper'
import type { AnyItem, ItemStoreOptions, PrimaryKeyQuery, StoredItem } from '~/types/item'
import { ObjectKeys } from '~/utils/object'

export const useItems = <Item extends AnyItem = AnyItem>(options: ItemStoreOptions<Item>) => {
  const { collectionName, primaryKey } = options

  const primaryKeys = Array.isArray(primaryKey) ? primaryKey : [primaryKey]

  const getRequestHash = (obj: any) => {
    return simpleHash(`${collectionName}/${JSON.stringify(obj)}`)
  }

  const toStoredItem = <T extends Item>(item: T): StoredItem<T> => ({
    ...item,
    __storedAt: new Date(),
  })

  const useItemStore = defineStore(`items:${collectionName}`, () => {
    const items: Ref<Array<StoredItem<Item>>> = ref([])

    const getItemByPrimaryKey = (query: RefLike<PrimaryKeyQuery<Item, typeof options>>) => computed(() => {
      const queryValue = unref(query)
      return items.value.find((item) => {
        return ObjectKeys(queryValue).every(key => item[key] === queryValue[key])
      })
    })

    const mergeOneStateItem = (newItem: Partial<Item>, oldItem: Item) => {
      return ObjectKeys(newItem).reduce((acc, key) => {
        acc[key] = newItem[key] ?? oldItem[key]
        return acc
      }, {} as Item)
    }

    const setOneStateItem = (item: Item) => {
      const existsAtIndex = items.value.findIndex(i => primaryKeys.every(key => i[key] === item[key]))
      if (existsAtIndex !== -1) {
        item = mergeOneStateItem(item, items.value[existsAtIndex])
        items.value.splice(existsAtIndex, 1, toStoredItem(item))
      }
      else {
        items.value.push({ ...item, __storedAt: new Date() })
      }
    }

    const setManyStateItems = (items: Item[]) => {
      items.forEach(setOneStateItem)
    }

    const removeOneStateItem = (item: Item) => {
      const existsAtIndex = items.value.findIndex(i => primaryKeys.every(key => i[key] === item[key]))
      if (existsAtIndex !== -1)
        items.value.splice(existsAtIndex, 1)
    }

    return {
      items,
      getItemByPrimaryKey,
      setOneStateItem,
      setManyStateItems,
      removeOneStateItem,
    }
  })

  const storeItem = async (item: Item) => {}
  const storeItems = async (item: Item[]) => {}

  const upsertItem = async (item: Item) => {}
  const upsertItems = async (items: Item[]) => {}

  const getItem = async (query: RefLike<PrimaryKeyQuery<Item, typeof options>>) => {}
  const getItems = async (queries: RefLike<PrimaryKeyQuery<Item, typeof options>>[]) => {}

  const removeItem = async (item: Item) => {}
  const removeItems = async (items: Item[]) => {}
}
