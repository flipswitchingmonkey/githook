import crypto from 'crypto'
import dayjs from 'dayjs'
import { GithookConfig, GithookHookConfig, GithookHookConfigEvent } from './types'
import { _config, _logger, _githookLastReceived } from './server'
import _ from 'lodash'

export const isGithookHookConfig = (val: any | unknown): val is GithookHookConfig => {
  if (val.name === undefined) _logger.log('Hook name missing')
  if (val.endpoint === undefined) _logger.log('Hook endpoint missing')
  if (val.secret === undefined) _logger.log('Hook secret missing')
  if (val.events === undefined) _logger.log('Hook events missing')
  return (
    val.name !== undefined &&
    val.endpoint !== undefined &&
    val.secret !== undefined &&
    val.events !== undefined
  )
}

export const isGithookHookConfigEvent = (val: any | unknown): val is GithookHookConfigEvent => {
  if (val.name === undefined) _logger.log('Event name missing')
  if (val.event === undefined) _logger.log(`Event ${val.name}: event missing`)
  if (val.body === undefined) _logger.log(`Event ${val.name}: body missing`)
  if (val.cmd === undefined) _logger.log(`Event ${val.name}: cmd missing`)
  return (
    val.name !== undefined &&
    val.event !== undefined &&
    val.body !== undefined &&
    val.cmd !== undefined
  )
}

export const isGithookConfig = (val: any | unknown): val is GithookConfig => {
  if (val.port === undefined) _logger.log('Config port missing')
  if (val.cooldown === undefined) _logger.log('Config cooldown missing')
  if (val.hooks === undefined) _logger.log('Config hooks missing')
  let hooksOK = true
  if (val.hooks !== undefined) {
    val.hooks.map((hook: unknown) => {
      if (isGithookHookConfig(hook)) {
        let eventsOK = true
        hook.events.map((ev: unknown) => {
          eventsOK = isGithookHookConfigEvent(ev) && eventsOK
        })
        hooksOK = eventsOK && hooksOK
      } else {
        hooksOK = false
      }
    })
  }
  return val.port !== undefined && val.cooldown !== undefined && hooksOK
}

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
    ? _githookLastReceived[id] + _config.cooldown < Date.now()
    : true
}

export const resetCooldown = (id: string | number, newCooldown?: Date): void => {
  _githookLastReceived[id] = newCooldown ? newCooldown.valueOf() : Date.now()
}

export const getRemainingCooldown = (id: string | number): number => {
  return _githookLastReceived[id] + _config.cooldown - Date.now()
}

export const checkMatchingBody = (event: GithookHookConfigEvent, body: any): boolean => {
  let doesMatch = true
  for (const bodyKey of _.keys(event.body)) {
    doesMatch = doesMatch && _.has(body, bodyKey) && _.get(body, bodyKey) === event.body[bodyKey]
  }
  return doesMatch
}

export const matchEventParamsToGithookBody = (event: GithookHookConfigEvent, body: any) => {}
