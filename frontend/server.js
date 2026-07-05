const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:4000";

app.get("/config.js", (_req, res) => {
  res.type("application/javascript");
  res.send(`window.APP_CONFIG = { apiBaseUrl: "${apiBaseUrl}" };`);
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  console.log(`frontend listening on port ${port}`);
});
