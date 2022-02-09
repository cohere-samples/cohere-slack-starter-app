const test = require("ava");
const { Reaction } = require("./../index");

class MockReaction extends Reaction {
  /**
   *
   * @return {string} messages in the channel's history
   */
   async channelHistory() {
    const messages = mockHistory.messages
    return messages.join("\n");
  }
}

const mockHistory = {
  ok: true,
  messages: [
    {
      type: "message",
      user: "U012AB3CDE",
      text: "I find you punny and would like to smell your nose letter",
      ts: "1512085950.000216",
    },
    {
      type: "message",
      user: "U061F7AUR",
      text: "What, you want to smell my shoes better?",
      ts: "1512104434.000490",
    },
  ],
  has_more: true,
  pin_count: 0,
  response_metadata: {
    next_cursor: "bmV4dF90czoxNTEyMDg1ODYxMDAwNTQz",
  },
};

const mockEvent = {
  type: "reaction_added",
  user: "U031RFEVCDT",
  item: { type: "message", channel: "C031DQ6SPQF", ts: "1646274858.928059" },
  reaction: "cohere",
  item_user: "U034SGYLMTP",
  event_ts: "1646279706.000400",
};

const mockClient = {
  client: {
    conversations: {
      history: () => mockHistory
    },
  },
};

test.skip("summarizes the past day of discussion in a channel", async (t) => {
  const { CoSummarize } = require("./summarize");
  const co = new CoSummarize(mockEvent, mockClient);
  co.reaction = new MockReaction
  const response = await co.summarize();

  if (response.length == 0) {
    t.fail();
  }

  if (response === null) {
    t.fail();
  }

  t.pass();
});
