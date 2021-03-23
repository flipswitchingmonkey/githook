import { GithookConfig } from './src/types'

const config: GithookConfig = {
  port: 9000,
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
      ],
    },
  ],
}

export default config
