require("dotenv").config();
const COHERE_API_TOKEN = process.env.COHERE_API_TOKEN;

const { Reaction } = require("./../index");
const cohere = require("cohere-ai");

class CoSummarize {
  constructor(event, client) {
    this.reaction = new Reaction(event, client);
  }

  /**
   *
   * @return {string} prompt for summarizing a channel's recent history
   */
  async prompt() {
    let history = await this.reaction.channelHistory();

    if (history.length > 2048) {
      history = history.substring(0, 2048)
      console.warn(`truncating channel history as ${history.length} exceeds 2048`)
      console.warn(history)
    }

    const prompt = `"Summarize the following conversation 1 sentence:\n
      ${history}\n\n
      Summary:\n
      The conversation details`;

    return prompt;
  }

  /**
   * summarize the channel's recent history using co:here's generation endpoint
   * @return {string} summarized discussion from co:here's generation endpoint.
   */
  async summarize() {
    const prompt = await this.prompt();
    cohere.init(COHERE_API_TOKEN);

    const res = await cohere.generate("large", {
      prompt: prompt,
      stop_sequences: ["."],
      max_tokens: 140,
      temperature: 1,
    });

    if (res.statusCode != 200) {
      console.warn(res)
      throw new Error(`${res.statusCode} received from cohere api`);
    }

    const summarized = res.body.generations[0].text
    return `*a summary of recent discussion*: ${summarized}`;
  }
}

const SummarizePlugin = {
  name: "eyes",
  exec: async function (event, client) {
    console.info(event);

    const co = new CoSummarize(event, client);
    const response = await co.summarize();
    return response;
  },
};

module.exports = { SummarizePlugin, CoSummarize };
