const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});

const { connectMQTT, publishCommand } = require("../src/mqtt/client");

connectMQTT();

setTimeout(() => {
  publishCommand({
    type: "relay_set",
    relay: 0,
    state: true
  });
}, 3000);