import type { RefLike } from './types'

export type StoredItem<T extends AnyItem> = SavedItem<T> & {
  __stored_at: number
}

export interface AnyItem {
  [key: string | number | symbol]: any
}

export type SavedItem<Item extends AnyItem> = {
  _id: string
  version: number
  version_id: string
  created_at: Date
  updated_at: Date
  created_by: string
  updated_by: string
} & Item

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

export interface ItemStoreOptions<Item extends AnyItem> {
  collectionName: string
  primaryKey: keyof Item | Array<keyof Item>
}

export const useItems = <T extends AnyItem>(options: ItemStoreOptions<T>) => {
  const { primaryKey } = options

  const primaryKeys = Array.isArray(primaryKey) ? primaryKey : [primaryKey]

  // whats the type of query? for intellisense have to be { email: string, city: string } based on the primarykeys from ItemStoreOptions
  const getItem = (query: RefLike<Pick<T, typeof primaryKeys[number]>>) => {
    console.log(query)
  }

  return {
    getItem,
  }
}

const itemStore = useItems<IUser>({ collectionName: 'users', primaryKey: ['email', 'city'] })

// Expected intellisense only: { email: string, city: string }
itemStore.getItem(ref({
  city: 'city',
  email: 'email',
}))
