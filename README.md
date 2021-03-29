## Githook

A simple node.js/Express server listening for Github Webhooks and executing commands upon receiving specific (or any) event.

Written in Typescript and running with ts-node too, because why compile to Javascript when we don't have to...

### Installation

```
git clone https://github.com/flipswitchingmonkey/githook.git
cd githook
yarn
mv githook.config.sample.ts githook.config.ts
vi githook.config.ts
```

### Congfiguration

Configuration happens in `githook.config.ts`. It's using a pretty straightforward json-like object to configure the server:

```
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

```

- `port` is the port the server will run on (e.g. http://localhost:9000). It is recommended to run the server behind e.g. nginx as a reverse proxy to use https. Functionality-wise this makes no difference though
- `cooldown` ms before webhook of the same endpoint can be handled. this is to prevent cases where the same hook is sent multiple times and then e.g. triggers a full rebuild of the app multiple times in parallel - we do not want that. Returns 429 to the exceeding requests.
- `verboseHeader|verboseBody|verboseMatches` output incoming webhooks details (can be _very_ verbose with large bodies)
- `hooks` is an array of `GithookHookConfig`:
  - `name` just a label for the log files
  - `repository` (optional) the full_name of the repository as sent in `req.body.repository.full_name` in the JSON payload (e. g. `flipswitchingmonkey/githook` in the case of this repository). If populated the name of the webhook's payload's repository must match, if left empty it is being ignored
  - `endpoint` the endpoint being set up by Express to listen for incoming webhooks
  - `secret` the secret as defined in your Github webhook. doing an SHA1 comparison at the moment, though you could also use - SHA256 if you like (it's in the code but not exposed right now)
  - `events` an array of `GithookHookConfigEvent`:
    - `event` a string with the Github event name as found in the `x-github-event` header
    - `cmd` the command to be executed via child_process. an example would be `'cd /to/my/repo && ./pullAndRestart.sh'`
    - `body` matching the webhook body. githook looks for matches using lodash's `_.has()` and `_.get()` methods, so what we have here are strings on either side of each attribute, the left side being the dotted path from the webhook body, the right being the content to match. So, to match a specific repository, this has to match: `'repository.full_name': 'flipswitchingmonkey/githook'`. Using this method we can match for any combination of webhook - and there are plenty, see https://docs.github.com/en/developers/webhooks-and-events/webhook-events-and-payloads for reference

The easiest way to set up the config is to create the webhooks first and have them fire, then look up the full body on Github's webhook log. The sample config listens for a PR merge (which creates multiple hook calls, one of them being the 'closed' action in combination with merged:true and the base branche it was merged into) into either development or master and reacts accordingly.

### Running

Recommended: use `pm2` to control the server, e.g. with `pm2 start yarn --interpreter bash --name githook -- start`

Alternatively run through `yarn start` or `yarn dev` for the development server version

### Setting up a webhook (the Github Actions way)

This repo contains a sample Github Action that triggers a webhook containing the entire usual Github Event data in its body, but can be manually triggered thanks to `workflow_dispatch` and also has the advantage of actually being inside the repository. Make sure to listen to the `'workflow_dispatch'` event in your configuration! Here's the sample code:

```
name: Deploy through webhook

# run manually
on:
  workflow_dispatch:

jobs:
  issue_webhook:
    runs-on: ubuntu-latest

    steps:
    - name: Webhook
      uses: distributhor/workflow-webhook@v1
      env:
        webhook_type: 'json-extended'
        webhook_url: ${{ secrets.WEBHOOK_URL }}
        webhook_secret: ${{ secrets.WEBHOOK_SECRET }}
```

`WEBHOOK_URL` and `WEBHOOK_SECRET` are set up in the repository settings under `settings/secrets/actions`

### Setting up a webhook (the old way)

![Screenshot 2021-03-23 at 16 49 19](https://user-images.githubusercontent.com/6930367/112186843-d1581a00-8c01-11eb-9364-03cccd5d244d.png)

### Example for updating Githook itself

This repo has an action set up like so - obviously you will need your own action so it points to the correct endpoint etc.

See example config above.

For running with pm2 use this:

pm2githook.sh

```
pm2 start yarn --interpreter bash --name githook -- start
```

update.sh

```
git pull
yarn
pm2 restart githook
```

Remember to `chmod +x update.sh`
