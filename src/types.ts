export interface GithookHookConfig {
  name: string
  endpoint: string
  secret: string
  events: GithookHookConfigEvent[]
}

export interface GithookHookConfigEvent {
  name: string
  event: string
  body: { [key: string]: string | number | boolean }
  cmd: string
  id?: string | number
}

export interface GithookConfig {
  port: number
  cooldown: number
  verboseHeader?: boolean
  verboseBody?: boolean
  verboseMatches?: boolean

  hooks: GithookHookConfig[]
}

export interface IncomingGithook {}
