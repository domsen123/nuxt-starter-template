import MD5 from 'crypto-js/md5'

export const simpleHash = (input: string) => {
  return MD5(input).toString()
}
