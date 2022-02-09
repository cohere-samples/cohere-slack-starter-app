const { Reaction } = require("./../index");

class CoPing {
  constructor(event) {
    this.reaction = new Reaction(event);
  }

  async ping() {
    return "oh hey, i didn't see you there";
  }
}

const PingPlugin = {
  name: "cohere",
  exec: async function (event) {
    console.info(event);

    const co = new CoPing(event);
    const response = await co.ping();
    return response;
  },
};

module.exports = { PingPlugin };
