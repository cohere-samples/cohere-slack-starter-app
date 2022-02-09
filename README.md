# cohere-slack-starter-app

: co:here / slack :<br/>
::: starter app :::

## developing

this project wraps https://github.com/slackapi/bolt-js. see official docs for details.

### reactions

when reactions occur in channels that the app subscribes to, a threaded reply with co:here-powered content will be posted.

to add a new reaction:

1. create a plugin under [`./plugins/reactions`](./plugins/reactions/).
1. 🔧 update [`./app.js`](./app.js) to require the new plugin and add it to `reactionPlugins`

see the following example plugins for reference:

| emoji       | description                                    |
| ----------- | ---------------------------------------------- |
| :cohere:    | health check to make sure the app is available |
| :summarize: | summarize recent conversation in a channel     |

### mentions

when mentioned, the app will reply with co:here-powered responses.

example mentions include:

```slack
@co ping
```

```slack
@co summarize https://arxiv.org/abs/2202.12837
```

to add a new mention:

1. create a plugin under [`./plugins/reactions`](./plugins/mentions/).
1. 🔧 update [`./app.js`](./app.js) to require the new plugin and add it to `mentionPlugins`

see the [`summarize`](./plugins/mentions/summarize.js) example plugin for reference.

### serve

```sh
yarn serve
```

this project leverages `dotenv` to source secrets into the running environment. see `example.env` for required configuration.

### test / debug

```sh
yarn test
yarn test:watch
```

see [example tests](https://github.com/avajs/ava/blob/main/docs/01-writing-tests.md) and [assertions](https://github.com/avajs/ava/blob/main/docs/03-assertions.md).
