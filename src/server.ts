import express from 'express'
import config from '../githook.config'
import { calcSignature } from './utils'
import { exec } from 'child_process'
import { Logger } from './logger'

const logger = new Logger({
  logconsole: true,
  timestamp: 'YYYY-DD-MM HH:mm:ss',
})
const app = express()

app.use(express.json())

app.use((req, res, next) => {
  res.sendStatus(401)
  next()
})

config.hooks.map(hook => {
  app.post(hook.endpoint, (req, res) => {
    if (req.body) {
      try {
        const signature = calcSignature(hook.secret, JSON.stringify(req.body))
        if (signature === req.headers['x-hub-signature']) {
          if (!hook.repository || req.body.repository.full_name === hook.repository) {
            const githubEvent = req.headers['x-github-event']?.toString()
            hook.events.map(event => {
              if (event.event.find(val => val === githubEvent || val === '*')) {
                logger.log(
                  `Received webhook "${hook.name}" event "${event.event}" -> (☞ﾟヮﾟ)☞ executing "${event.cmd}"`,
                )
                exec(event.cmd)
              } else {
                logger.log(`Received webhook "${hook.name}" but no event matches -> (⊙︿⊙)"`)
              }
            })
          } else {
            logger.log(
              `Received webhook "${hook.name}" but signature does not match -> (╯°□°)╯︵ ┻━┻"`,
            )
          }
        }
      } catch (e) {
        logger.log(`Exception! ヽ(。_°)ノ ${e}`)
      }
    }
  })
})

app.listen(config.port, () => {
  console.log(`⚡️[server]: Githook Server is running at https://localhost:${config.port}`)
  console.log(`⚡️[server]: Setting up listeners:`)
  const hooks: any[] = config.hooks.map(hook => {
    return {
      name: hook.name,
      endpoint: hook.endpoint,
      repository: hook.repository || 'n/a',
      events: hook.events.map(event => {
        return `${event.event}: ${event.cmd}`
      }),
    }
  })
  console.table(hooks)
})
