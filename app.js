require("dotenv").config();

const { App, LogLevel } = require("@slack/bolt");
const { Mention, Reaction } = require("./plugins/index");

/**
 * a co:here-flavoured @slack/bolt app
 *
 * register plugins on creation and expects callers to invoke `serve()`
 */
class CohereSlackApp {
  constructor() {
    const cfg = {
      token: process.env.SLACK_BOT_TOKEN,
      appToken: process.env.SLACK_APP_TOKEN,
      socketMode: true,
    };
    this.app = new App(cfg);

    this.mentionPlugins = {};
    this.registerMentionPlugins();

    this.reactionPlugins = {};
    this.registerReactionPlugins();
  }

  /**
   * start an http server configured with handlers supplied by
   * registered plugins
   */
  async serve() {
    await this.app.start(process.env.PORT || 3000);
    console.log("⚡️ Bolt app is running!", process.env.PORT);
  }

  /**
   * register plugins from ./plugins/mentions
   *
   * 🔧 require a plugin and add it to `mentionPlugins`
   */
  registerMentionPlugins() {
    const { PingPlugin } = require("./plugins/mentions/ping");
    const { SummarizePlugin } = require("./plugins/mentions/summarize");
    const mentionPlugins = [PingPlugin, SummarizePlugin];

    mentionPlugins.forEach((plugin) => {
      const { name, exec } = plugin;
      this.mentionPlugins[name] = exec;
    });

    this.app.event("app_mention", async ({ event, context, client, say }) => {
      console.info(event);

      const mention = new Mention(event);
      const subcommand = mention.subcommand();
      const func = this.mentionPlugins[subcommand];

      try {
        const response = await func(event);

        // threaded response
        await client.chat.postMessage({
          channel: event.channel,
          thread_ts: event.ts,
          text: response,
        });
      } catch (error) {
        console.error(error);
      }
    });
  }

  /**
   * register plugins from ./plugins/reactions
   *
   * 🔧 require a plugin and add it to `reactionPlugins`
   */
  registerReactionPlugins() {
    const { PingPlugin } = require("./plugins/reactions/ping");
    const { SummarizePlugin } = require("./plugins/reactions/summarize");
    const reactionPlugins = [PingPlugin, SummarizePlugin];

    reactionPlugins.forEach((plugin) => {
      const { name, exec } = plugin;
      this.reactionPlugins[name] = exec;
    });

    this.app.event("reaction_added", async ({ event, context, client, say }) => {
      console.info(event);
      const func = this.reactionPlugins[event.reaction];

      try {
        const response = await func(event, client);

        // unthreaded response
        const result = await say(response);
        console.log(result)
      } catch (error) {
        console.error(error);
      }
    });
  }
}

module.exports = { CohereSlackApp };
