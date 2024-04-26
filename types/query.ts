import type { PipelineStage } from 'mongoose'
import type { Filter as MongoFilter } from 'mongodb'
import type { AnyItem, StoredItem } from './item'

export interface ItemQuery<Item extends AnyItem = AnyItem> {
  select?: Array<keyof StoredItem<Item> | '*' >
  filter?: MongoFilter<StoredItem<Item>>
  sort?: Array<[keyof StoredItem<Item>, 1 | -1]>
  aggregate?: PipelineStage[]
  search?: string
  limit?: number
  offset?: number
  page?: number
  singleton?: boolean
}
