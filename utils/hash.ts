import { createHash } from 'node:crypto'

export const simpleHash = (input: string) => {
  return createHash('xxhash64').update(input).digest('hex')
}
