export type StoredItem<T extends AnyItem> = T & {
  __storedAt: Date
}

export interface AnyItem {
  [key: string | number | symbol]: any
}

export type SinglePrimaryKey<Item> = keyof Item
export type MultiplePrimaryKey<Item> = Array<keyof Item>

export interface ItemStoreOptions<Item extends AnyItem> {
  collectionName: string
  primaryKey: SinglePrimaryKey<Item> | MultiplePrimaryKey<Item>
  ttl: number
}

// Hilfstyp für den Fall, dass primaryKey ein einzelner Schlüssel ist
type SinglePrimaryKeyQuery<Item extends AnyItem, Key extends keyof Item> = {
  [P in Key]: Item[P];
}

// Hilfstyp für den Fall, dass primaryKey ein Array von Schlüsseln ist
type MultiplePrimaryKeyQuery<Item extends AnyItem, Keys extends Array<keyof Item>> = {
  [P in Keys[number]]: Item[P];
}

export type PrimaryKeyQuery<Item extends AnyItem, Options extends ItemStoreOptions<Item>> =
  Options['primaryKey'] extends Array<keyof Item>
    ? MultiplePrimaryKeyQuery<Item, Options['primaryKey']>
    : SinglePrimaryKeyQuery<Item, Extract<Options['primaryKey'], keyof Item>>
