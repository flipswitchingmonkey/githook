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
```

- `port` is the port the server will run on (e.g. http://localhost:9000). It is recommended to run the server behind e.g. nginx as a reverse proxy to use https. Functionality-wise this makes no difference though
- `cooldown` ms before webhook of the same endpoint can be handled. this is to prevent cases where the same hook is sent multiple times and then e.g. triggers a full rebuild of the app multiple times in parallel - we do not want that. Returns 429 to the exceeding requests.
- `verbose` output incoming webhooks details (can be _very_ verbose with large bodies)
- `hook` is an array of `GithookHookConfig`:
  - `name` just a label for the log files
  - `repository` (optional) the full_name of the repository as sent in `req.body.repository.full_name` in the JSON payload (e. g. `flipswitchingmonkey/githook` in the case of this repository). If populated the name of the webhook's payload's repository must match, if left empty it is being ignored
  - `endpoint` the endpoint being set up by Express to listen for incoming webhooks
  - `secret` the secret as defined in your Github webhook. doing an SHA1 comparison at the moment, though you could also use - SHA256 if you like (it's in the code but not exposed right now)
  - `events` an array of `GithookHookConfigEvent`:
    - `event` an array of strings with the Github event name as found in the `x-github-event` header. Can listen to multiple events (one array entry per event) or `'*'` to just listen to any event coming in. event and action can be combined for events that support it, e.g. `release` events which can have created, published, released actions. an event would be `released:published` for example to only trigger when that release has been published, not e.g. just drafted. `release` and `release:*` are treated the same.
    - `cmd` the command to be executed via child_process. an example would be `'cd /to/my/repo && ./pullAndRestart.sh'`

### Running

Recommended: use `pm2` to control the server, e.g. with `pm2 start yarn --interpreter bash --name githook -- start`

Alternatively run through `yarn start` or `yarn dev` for the development server version

### Setting up a webhook

![Screenshot 2021-03-23 at 16 49 19](https://user-images.githubusercontent.com/6930367/112186843-d1581a00-8c01-11eb-9364-03cccd5d244d.png)
