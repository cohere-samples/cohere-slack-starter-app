/**
 * provides helpers for parsing bot mentions
 *
 */
class Mention {
  /**
   * accepts a slack/bolt event
   *
   * @param {event} event a slack/bolt event
   */
  constructor(event) {
    this.text = event.text;
  }

  /**
   * subcomand requested during a direct mention event
   * @return {string | null} subcommand or null if parsing fails.
   */
  subcommand() {
    const argline = this.text.split(" ");
    if (argline.length < 2) {
      return null;
    }
    return argline[1];
  }

  /**
   * arguments supplied during a direct mention event
   * @return {Array<string> | null} an array of trailing arguments or null if parsing fails
   */
  arguments() {
    const argline = this.text.split(" ");
    if (argline.length < 2) {
      return null;
    }
    return argline.slice(2);
  }
}

/**
 * provides helpers for parsing message reactions
 *
 * @param {event} event a slack/bolt event
 * @param {client} client a slack/bolt client
 *
 */
class Reaction {
  /**
   * accepts a slack/bolt event and client.
   *
   * @param {event} event a slack/bolt event
   * @param {client} client a slack/bolt client
   */
  constructor(event, client) {
    this.event = event;
    this.client = client;
  }

  /**
   * @return {string} the reaction name, typically an emoji (ex: ✨, `sparkles`)
   */
  name() {
    return this.event.reaction;
  }

  /**
   * @return {string} the channel name that the reaction occurred in
   */
  channel() {
    return this.event.item.channel;
  }

  /**
   *
   * @return {string} the timestamp of the message that the reaction occurred on
   */
  timestamp() {
    return this.event.item.ts;
  }

  /**
   *
   * @return {string} the text of the message that the reaction occurred on
   */
  async message() {
    const history = new ChannelHistory(
      this.client,
      this.channel(),
      this.timestamp()
    );
    return history.latest();
  }

  /**
   *
   * @return {string} the first url found in the message that the reaction occurred on
   */
  async messageUrl() {
    const message = await this.message();
    return message
      .split(" ")
      .filter((word) => word.replace("<", "").startsWith("https://"));
  }

  /**
   *
   * @return {string} messages in the channel's history
   */
  async channelHistory() {
    const history = new ChannelHistory(
      this.client,
      this.channel(),
      this.timestamp()
    );
    const messages = await history.lastHundred();
    const supportedMessages = messages.filter((msg) => !msg.startsWith("<"))
    return supportedMessages.join("\n");
  }
}

/**
 * provides helpers for fetching channel history for common time periods
 * and groupings.
 *
 * @param {client} client a slack api client
 * @param {channel} channel a slack channel name
 * @param {ts} ts timestamp to begin scanning from
 *
 */
class ChannelHistory {
  /**
   * accepts a client for reading history, the channel name and a timestamp to
   * begin scanning from.
   *
   * @param {client} client a slack api client
   * @param {channel} channel a slack channel name
   * @param {ts} ts timestamp to begin scanning from
   */
  constructor(client, channel, ts) {
    this.client = client;
    this.channel = channel;
    this.ts = ts;
  }

  /**
   * a single message at the latest timestamp
   *
   * @return {string} the text of the message that the reaction occurred on
   */
  async latest() {
    let text;
    try {
      const res = await this.client.conversations.history({
        oldest: this.ts,
        channel: this.channel,
        inclusive: true,
        limit: 1,
      });
      res.messages.forEach((msg) => {
        text = msg.text;
      });
    } catch (error) {
      console.error(error);
    }

    return text;
  }

  /**
   * the most recent hundred meessages
   * @return {Array<string>} an array of messages
   */
  async lastHundred() {
    try {
      const result = await this.client.conversations.history({
        latest: this.ts,
        channel: this.channel,
        inclusive: true,
        limit: 100,
      });

      if (!result.hasMore) {
        console.warn("paging not yet implemented. prs welcome!");
      }

      return result.messages.map((msg) => msg.text);
    } catch (error) {
      console.error(error);
    }
    return [];
  }
}

module.exports = { Mention, Reaction };
