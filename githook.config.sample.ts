import { GithookConfig } from './src/types'

const config: GithookConfig = {
  port: 9000,
  cooldown: 3000,
  verboseHeader: false,
  verboseBody: false,
  hooks: [
    {
      name: 'example',
      endpoint: '/myrepohook',
      repository: 'flipswitchingmonkey/githook',
      secret: 'mysupersecretkey',
      events: [
        {
          event: ['*'],
          cmd: 'echo "A webhook as arrived!"',
        },
        {
          event: ['release:published'],
          cmd: 'echo "release:published has arrived!"',
        },
        {
          event: ['push'],
          cmd: 'echo "push has arrived!"',
        },
        {
          event: ['release:*'],
          cmd: 'echo "release:* has arrived!"',
        },
      ],
    },
  ],
}

export default config
