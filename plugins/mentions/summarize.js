require("dotenv").config();
const COHERE_API_TOKEN = process.env.COHERE_API_TOKEN;

const axios = require("axios");
const cohere = require("cohere-ai");
const { JSDOM } = require("jsdom");
const { Mention } = require("./../index");

/**
 * co:summarize provides helpers for parsing @co mentions
 * with that specify the `summarize` subcommand.
 *
 */
class CoSummarize {
  constructor(event) {
    const mention = new Mention(event);
    this.mention = mention;

    if (mention.subcommand() != summarize) {
      throw new Error("failed to parse subcommand");
    }
  }

  /**
   * abstract fetches a paper's abstract given its hyperlink url
   * @summary parses an abstract from the provided hyperlink url
   * @param {string} url - http url for a paper (ex: https://arxiv.org/abs/1706.03762)
   * @return {string} abstract parsed from the provided hyperlink
   **/
  async abstract(url) {
    try {
      const { data } = await axios.get(url);
      const dom = new JSDOM(data);
      const { document } = dom.window;
      const abstract = document.querySelector("#abs > blockquote");
      return abstract.textContent;
    } catch (error) {
      throw error;
    }
  }

  /**
   * prompt specified during a summarize subcommand
   * @summary all trailing arguments parsed from the entire command
   * @return {string} all trailing arguments parsed from the entire summarize command
   */
  async prompt() {
    const urlWithBraces = this.mention.arguments()[0];
    const url = urlWithBraces.replace("<", "").replace(">", "");
    const abstract = await this.abstract(url);
    const prompt = `"Summarize the following paper in 1 sentence:\n
      ${abstract}\n\n
      Summary:\n
      The paper details`;

    return prompt;
  }

  /**
   * summarize text using co:here's generation endpoint
   * @return {string} summarized text from co:here's generation endpoint.
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
      throw new Error(`${res.statusCode} received from cohere api`);
    }

    return res.body.generations[0].text;
  }
}

const summarize = "summarize";
const SummarizePlugin = {
  name: summarize,
  exec: async function (event) {
    console.info(event);
    let response = `failed to summarize text from the co:here api`;

    const co = new CoSummarize(event);

    try {
      const summarized = await co.summarize();
      response = `*the paper details*: ${summarized}`;
    } catch (error) {
      console.error(error);
    } finally {
      return response;
    }
  },
};

module.exports = { SummarizePlugin, CoSummarize };
