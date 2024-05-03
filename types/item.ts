import type { Filter as MongoFilter, ObjectId } from 'mongodb'
import type { PipelineStage } from 'mongoose'

export interface AnyItem {
  [key: string]: any
}

export type SavedItem<Item extends AnyItem> = {
  _id: string | ObjectId
  version: number
  version_id: string
  created_at: Date
  updated_at: Date
  created_by: string
  updated_by: string
} & Item

export type StoredItem<Item extends AnyItem> = SavedItem<Item> & {
  __stored_at: number
  __collection: string
}

export interface ItemStoreOptions<Item extends AnyItem> {
  collectionName: string
  primaryKey: keyof SavedItem<Item> | Array<keyof SavedItem<Item>>
  ttl?: number
}

export type Filter<Item extends AnyItem> = MongoFilter<StoredItem<Item>>

export interface ItemQuery<Item extends AnyItem = AnyItem> {
  select?: Array<keyof StoredItem<Item> | '*' >
  filter?: Filter<StoredItem<Item>>
  sort?: Array<[keyof StoredItem<Item>, 1 | -1]>
  // aggregate?: PipelineStage[]
  // search?: string
  limit?: number
  offset?: number
  page?: number
  singleton?: boolean
}
