import { GithookConfig } from './src/types'

const config: GithookConfig = {
  port: 9000,
  cooldown: 2000,
  verboseHeader: true,
  verboseBody: false,
  verboseMatches: false,
  hooks: [
    {
      name: 'HookTest',
      endpoint: '/hook_test',
      secret: 'somesecret',
      events: [
        {
          name: 'PR merged with master',
          event: 'pull_request',
          body: {
            'repository.full_name': 'flipswitchingmonkey/githook',
            'action': 'closed',
            'pull_request.merged': true,
            'pull_request.base.ref': 'master',
          },
          cmd: 'echo PR merged with master"',
        },
        {
          name: 'PR merged with development',
          event: 'pull_request',
          body: {
            'repository.full_name': 'flipswitchingmonkey/githook',
            'action': 'closed',
            'pull_request.merged': true,
            'pull_request.base.ref': 'development',
          },
          cmd: 'echo PR merged with development"',
        },
        {
          name: 'New release',
          event: 'release',
          body: {
            'repository.full_name': 'flipswitchingmonkey/githook',
            'action': 'published',
          },
          cmd: 'cd /opt/githook && ./update.sh',
        },
        {
          name: 'New release (manual)',
          event: 'workflow_dispatch',
          body: {
            'repository.full_name': 'flipswitchingmonkey/githook',
            'workflow': '.github/workflows/deploy_webhook.yml',
          },
          cmd: 'cd /opt/githook && ./update.sh',
        },
      ],
    },
  ],
}

export default config
