import express from 'express'
import config from '../githook.config'
import { calcSignature } from './utils'
import { exec } from 'child_process'
import { Logger } from './logger'

const logger = new Logger({
  logconsole: true,
  timestamp: 'YYYY-DD-MM HH:mm:ss',
})

const _githookLastReceived: { [key: string]: number } = {}

const app = express()

app.use(express.json())
config.hooks.map(hook => {
  app.post(hook.endpoint, (req, res) => {
    let status = 200
    if (config.verboseHeader) console.table(req.headers)
    if (config.verboseBody) console.log(req.body)
    if (_githookLastReceived[hook.endpoint] + config.cooldown < Date.now()) {
      _githookLastReceived[hook.endpoint] = Date.now()
      try {
        const signature = calcSignature(hook.secret, JSON.stringify(req.body))
        if (signature === req.headers['x-hub-signature']) {
          if (!hook.repository || req.body.repository.full_name === hook.repository) {
            const githubEvent = req.headers['x-github-event']?.toString()
            const githubEventAction = req.body.action
              ? `${githubEvent}:${req.body.action}`
              : githubEvent
            hook.events.map(event => {
              const eventParts = event.event
              if (
                event.event.find(
                  val =>
                    val === githubEvent ||
                    val === githubEventAction ||
                    val === `${githubEvent}:*` ||
                    val === '*',
                )
              ) {
                logger.log(
                  `Received webhook "${hook.name}" event "${githubEventAction}" matching "${event.event}" -> (☞ﾟヮﾟ)☞ executing "${event.cmd}"`,
                )
                const cmdProcess = exec(event.cmd)
                cmdProcess.stdout?.pipe(process.stdout)
                status = 200
              } else {
                // logger.log(`Received webhook "${hook.name}" but no event matches -> (⊙︿⊙)"`)
                status = 501
              }
            })
          } else {
            logger.log(
              `Received webhook "${hook.name}" but signature does not match -> (╯°□°)╯︵ ┻━┻"`,
            )
            status = 401
          }
        }
      } catch (e) {
        logger.log(`Exception! ヽ(。_°)ノ ${e}`)
      }
    } else {
      const waitfor = _githookLastReceived[hook.endpoint] + config.cooldown - Date.now()
      logger.log(
        `Received webhook "${hook.name}" (again) but cooldown has not finished. Try again in ${waitfor}ms`,
      )
      status = 429
    }
    res.sendStatus(status)
    res.end()
  })
})

app.listen(config.port, () => {
  console.log(`⚡️[server]: Githook Server is running at http://localhost:${config.port}`)
  console.log(`⚡️[server]: Setting up listeners:`)
  const hooks: any[] = config.hooks.map(hook => {
    _githookLastReceived[hook.endpoint] = Date.now()
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
