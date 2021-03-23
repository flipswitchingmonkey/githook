export interface GithookHookConfig {
  name: string
  repository?: string
  endpoint: string
  secret: string
  events: GithookHookConfigEvent[]
}

export interface GithookHookConfigEvent {
  event: string[]
  cmd: string
}

export interface GithookConfig {
  port: number
  cooldown: number
  verboseHeader?: boolean
  verboseBody?: boolean
  hooks: GithookHookConfig[]
}
