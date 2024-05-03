import { StorageDriverMongo } from '~/server/storage/drivers/mongo'

export default defineEventHandler(async (event) => {
  const collection = getRouterParam(event, 'collection') as string
  const body = await readBody(event)

  const storageService = new StorageDriverMongo(collection)

  return await storageService.queryMany(body)
})
