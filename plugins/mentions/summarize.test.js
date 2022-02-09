const test = require("ava");

const mockEvent = {
  client_msg_id: "cd5dfa27-5119-4e26-8cc9-5d2d89078e34",
  type: "app_mention",
  text: "<@U0325RLFV2R> summarize https://arxiv.org/abs/1706.03762",
  user: "U02UMPS3161",
  ts: "1644553187.910889",
  team: "TV82C32HX",
  blocks: [{ type: "rich_text", block_id: "3lkk", elements: [Array] }],
  channel: "C032241D430",
  event_ts: "1644553187.910889",
};

test.skip("summarizes text using the co:here api", async (t) => {

  const { CoSummarize } = require("./summarize")
  const co = new CoSummarize(mockEvent);
  const prompt = await co.prompt()

  if (prompt.startsWith("i am a robot")) {
    t.fail()
  }

  const summary = await co.summarize()

  if (summary === undefined) {
    t.fail();
  }

  if (summary.length == 0) {
    t.fail();
  }

  t.pass()
});
