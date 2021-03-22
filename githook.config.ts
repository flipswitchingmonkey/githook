import { GithookConfig } from './src/types'

const config: GithookConfig = {
  port: 9000,
  hooks: [
    {
      name: 'test',
      endpoint: '/',
      secret: 'fa83b204-f779-4a67-bf6b-d3785c81dc46',
      events: [
        {
          event: '*',
          cmd: 'echo Event',
        },
      ],
    },
    {
      name: 'test2',
      endpoint: '/test',
      secret: '636520ce-c166-45cf-a088-2150b1686628',
      events: [
        {
          event: '*',
          cmd: 'echo blah',
        },
      ],
    },
  ],
}

export default config
