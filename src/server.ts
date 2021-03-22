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
    // console.log(req.headers['x-hub-signature'])
    // console.log(req.headers['x-hub-signature-256'])
    if (req.body) {
      const signature = calcSignature(hook.secret, JSON.stringify(req.body))
      if (signature === req.headers['x-hub-signature']) {
        const githubEvent = req.headers['x-github-event']?.toString()
        hook.events.map(event => {
          if (event.event === githubEvent || event.event === '*') {
            logger.log(
              `Received webhook "${hook.name}" event "${event.event}" -> executing "${event.cmd}"`,
            )

            exec(event.cmd)
          }
        })
      }
    }
  })
})

app.get('/', (req, res) => res.send('Express + TypeScript Server'))

app.listen(config.port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${config.port}`)
})
