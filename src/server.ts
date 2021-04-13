import express from 'express'
import _ from 'lodash'
import {
  calcSignature,
  checkCooldown,
  checkMatchingBody,
  findEventInHook,
  getRemainingCooldown,
  isGithookConfig,
  resetCooldown,
} from './utils'
import { exec } from 'child_process'
import { Logger } from './logger'
import { v4 as uuidv4 } from 'uuid'

import { GithookConfig } from './types'
import * as configJson from '../githook.config.json'

export const _logger = new Logger({
  logconsole: true,
  timestamp: 'YYYY-DD-MM HH:mm:ss',
})

export let _config: GithookConfig
if (isGithookConfig(configJson)) {
  _config = configJson
} else {
  _logger.log('Error in githook._config.json, type mismatch')
  process.exit()
}

export const _githookLastReceived: { [key: string]: number } = {}

const app = express()

app.use(express.json())
_config.hooks.map(hook => {
  app.post(hook.endpoint, (req, res) => {
    let status = 200
    if (_config.verboseHeader) console.table(req.headers)
    if (_config.verboseBody) console.log(req.body)

    try {
      const signature = calcSignature(hook.secret, JSON.stringify(req.body))
      if (signature === req.headers['x-hub-signature']) {
        const githubEventName = req.headers['x-github-event']?.toString() || '*'
        const matchingEvents = findEventInHook(hook, githubEventName)
        if (matchingEvents?.length > 0) {
          matchingEvents.map(matchingEvent => {
            if (checkMatchingBody(matchingEvent, req.body)) {
              if (checkCooldown(matchingEvent.id!)) {
                resetCooldown(matchingEvent.id!)
                _logger.log(
                  `Received webhook "${hook.name}" matching ${matchingEvent.id} -> executing "${matchingEvent.cmd}"`,
                )
                if (_config.verboseMatches) {
                  console.log(matchingEvent)
                }
                const cmdProcess = exec(matchingEvent.cmd)
                cmdProcess.stdout?.pipe(process.stdout)
                status = 200
              } else {
                _logger.log(
                  `Received webhook "${hook.name}" matching ${
                    matchingEvent.id
                  } (again) but cooldown has not finished. Try again in ${getRemainingCooldown(
                    matchingEvent.id!,
                  )}ms`,
                )
                status = 429
              }
            }
          })
        } else {
          status = 501
        }
      } else {
        _logger.log(
          `Received webhook "${hook.name}" but signature does not match -> (╯°□°)╯︵ ┻━┻"`,
        )
        status = 401
      }
      // }
    } catch (e) {
      _logger.log(`Exception! ヽ(。_°)ノ ${e}`)
    }

    res.sendStatus(status)
    res.end()
  })
})

app.listen(_config.port, () => {
  console.log(`⚡️[server]: Githook Server is running at http://localhost:${_config.port}`)
  console.log(`⚡️[server]: Setting up listeners:`)
  for (let index = 0; index < _config.hooks.length; index++) {
    _config.hooks[index].events = _config.hooks[index].events.map((event, index) => {
      const id = uuidv4()
      resetCooldown(id)
      return { ...event, id: uuidv4() }
    })
  }
  console.dir(
    _config.hooks.map(hook => {
      return {
        ...hook,
        secret: '***',
        events: hook.events.map(event => `${event.name} (${event.id})`),
      }
    }),
    { maxArrayLength: null },
  )
})
