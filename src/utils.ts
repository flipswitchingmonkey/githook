import crypto from 'crypto'
import dayjs from 'dayjs'
import { GithookHookConfig, GithookHookConfigEvent } from './types'
import config from '../githook.config'
import { _githookLastReceived } from './server'
import _ from 'lodash'

export const calcSignature = (secret: string, data: string, method: string = 'sha1'): string => {
  return `${method}=` + crypto.createHmac(method, secret).update(data).digest('hex')
}

export const log = (message: string): void => {
  console.log(`${dayjs().format('YYYY-DD-MM HH:mm:ss')}: ${message}`)
}

export const findEventInHook = (
  hook: GithookHookConfig,
  eventName: string,
): GithookHookConfigEvent[] => {
  return hook.events.filter(configEvent => configEvent.event === eventName)
}

export const checkCooldown = (id: string | number): boolean => {
  return id && _githookLastReceived[id]
    ? _githookLastReceived[id] + config.cooldown < Date.now()
    : true
}

export const resetCooldown = (id: string | number, newCooldown?: Date): void => {
  _githookLastReceived[id] = newCooldown ? newCooldown.valueOf() : Date.now()
}

export const getRemainingCooldown = (id: string | number): number => {
  return _githookLastReceived[id] + config.cooldown - Date.now()
}

export const checkMatchingBody = (event: GithookHookConfigEvent, body: any): boolean => {
  let doesMatch = true
  for (const bodyKey of _.keys(event.body)) {
    doesMatch = doesMatch && _.has(body, bodyKey) && _.get(body, bodyKey) === event.body[bodyKey]
  }
  return doesMatch
}

export const matchEventParamsToGithookBody = (event: GithookHookConfigEvent, body: any) => {}
