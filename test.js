const test = require("ava");
const { CohereSlackApp } = require("./app");

test.beforeEach((t) => {
  const app = new CohereSlackApp()
  t.context = {
    app: app,
  };
});

test("registers plugins", (t) => {
  const pluginCount =
    Object.keys(t.context.app.mentionPlugins).length +
    Object.keys(t.context.app.reactionPlugins).length
  t.is(pluginCount, 4);
});
