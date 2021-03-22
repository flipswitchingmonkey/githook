import dayjs from 'dayjs'
import fs from 'fs'

export interface LoggerConfig {
  logfile?: string
  logconsole?: boolean
  timestamp?: string
}
export class Logger {
  logfile: string | undefined
  logconsole: boolean | undefined
  timestamp: string | undefined

  constructor(config: LoggerConfig) {
    this.logfile = config.logfile
    this.logconsole = config.logconsole
    this.timestamp = config.timestamp
  }

  log = (message: string): void => {
    const ts = this.timestamp ? dayjs().format(this.timestamp) + ': ' : ''
    const msg = `${ts}${message}`
    if (this.logconsole) console.log(msg)
    if (this.logfile) fs.appendFileSync(this.logfile, msg + '\n')
  }
}
