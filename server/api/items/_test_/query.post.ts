export default defineEventHandler(async (event) => {
  return {
    id: 123,
    ts: new Date().toISOString(),
  }
})
