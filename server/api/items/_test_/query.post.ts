export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return { ...body, email: 'test', address: 'test' }
})
