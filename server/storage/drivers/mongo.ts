import type { Db, Filter } from 'mongodb'
import { MongoClient } from 'mongodb'
import type { AnyItem, ItemQuery } from '~/types'

export class StorageDriverMongo<Item extends AnyItem> {
  private mongoUri: string
  private mongoDatabase: string
  private client: MongoClient
  private db: Db
  constructor(private collectionName: string) {
    const config = useRuntimeConfig()
    this.mongoUri = config.mongoUri
    this.mongoDatabase = config.mongoDatabase
    this.client = new MongoClient(this.mongoUri)
    this.db = this.client.db(this.mongoDatabase)
  }

  private get collection() {
    return this.db.collection(this.collectionName)
  }

  async queryMany(query: ItemQuery<Item>) {
    try {
      await this.client.connect()
      const filter = query.filter ?? {}

      const promise = this.collection.find(filter)

      if (query.sort)
        promise.sort(query.sort.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}))

      if (query.select && !query.select.includes('*'))
        promise.project(query.select.reduce((acc, key) => ({ ...acc, [key]: 1 }), {}))

      const offset = query.page ? (query.page - 1) * (query.limit ?? 15) : (query.offset ?? 0)
      const limit = query.page ? (query.limit ?? 15) : (query.limit ?? 0)
      promise.skip(offset).limit(limit)

      let result: any = await promise.toArray()

      if (result && result.length >= 1 && query.singleton)
        result = result[0]

      return result
    }
    catch (error) {
      console.error(error)
      throw error
    }
    finally {
      await this.client.close()
    }
  }

  async findOne(query: ItemQuery<Item>) {
    try {
      await this.client.connect()
      const filter = query.filter ?? {}
      const item = await this.collection.findOne(filter)
      return item
    }
    catch (error) {
      console.error(error)
      throw error
    }
    finally {
      await this.client.close()
    }
  }
}
