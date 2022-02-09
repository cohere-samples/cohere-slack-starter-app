const { Mention } = require("./../index");

class CoPing {
  constructor(event) {
    const mention = new Mention(event);
    this.mention = mention;

    if (mention.subcommand() != "ping") {
      throw new Error("failed to parse subcommand");
    }
  }

  async ping() {
    return "oh hey, i didn't see you there";
  }
}

const PingPlugin = {
  name: "ping",
  exec: async function (event) {
    console.info(event);

    const co = new CoPing(event);
    const response = await co.ping();
    return response;
  },
};

module.exports = { PingPlugin };
