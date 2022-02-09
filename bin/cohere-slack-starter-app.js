require("dotenv").config();

(async () => {
  const { CohereSlackApp } = require("../app");
  const app = new CohereSlackApp();
  await app.serve()
})();
