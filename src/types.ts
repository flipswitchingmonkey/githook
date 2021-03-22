export interface GithookHookConfig {
  name: string
  endpoint: string
  secret: string
  events: {
    event: string
    cmd: string
  }[]
}

export interface GithookConfig {
  port: number
  hooks: GithookHookConfig[]
}
