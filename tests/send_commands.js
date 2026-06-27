// const path = require("path");

// require("dotenv").config({
//   path: path.resolve(__dirname, "../.env"),
// });

// const {
//   connectMQTT,
//   publishCommand,
//   getClient,
// } = require("../src/mqtt/client");

// // Start the MQTT connection
// connectMQTT();

// // Wait until the client is actually connected
// const interval = setInterval(() => {
//   const client = getClient();

//   if (!client || !client.connected) {
//     return;
//   }

//   clearInterval(interval);

//   const cmdId = publishCommand({
//     type: "relay_set",
//     relay: 1,
//     state: true,
//   });

//   console.log("Published Command:", cmdId);

// }, 500);

const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const mqtt = require("mqtt");
const crypto = require("crypto");

// Independent MQTT client used only for testing.
// Uses a unique clientId so it never disconnects the backend.
const client = mqtt.connect(
  `mqtts://${process.env.MQTT_BROKER_URL}:${process.env.MQTT_PORT}`,
  {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    clientId: "smartnest_test_sender",
    clean: true,
  }
);

const BASE = process.env.MQTT_BASE_TOPIC;

client.on("connect", () => {
  console.log("[Test Sender] Connected");

  const command = {
    cmd_id: crypto.randomUUID(),

    type: "relay_set",
    relay: 1,
    state: true,
  };

  client.publish(
    `${BASE}/cmd/request`,
    JSON.stringify(command),
    { qos: 1 },
    () => {
      console.log("[Test Sender] Command Published");
      console.log(command);

      // Test is complete.
      client.end();
    }
  );
});

client.on("error", (err) => {
  console.error("[Test Sender] MQTT Error:", err.message);
});

client.on("close", () => {
  console.log("[Test Sender] Connection Closed");
});