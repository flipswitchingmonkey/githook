import crypto from 'crypto'
import dayjs from 'dayjs'

export const calcSignature = (secret: string, data: string, method: string = 'sha1'): string => {
  return `${method}=` + crypto.createHmac(method, secret).update(data).digest('hex')
}

export const log = (message: string): void => {
  console.log(`${dayjs().format('YYYY-DD-MM HH:mm:ss')}: ${message}`)
}
