const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});

const mqtt = require("mqtt");

// console.log(process.env); // TESTING PURPOSES ONLY - REMOVE THIS IN PRODUCTION

const client = mqtt.connect(
  `mqtts://${process.env.MQTT_BROKER_URL}:${process.env.MQTT_PORT}`,
  {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    clientId: "smartnest_fake_esp32",
    clean: true,
  }
);

const BASE = process.env.MQTT_BASE_TOPIC || "smartnest";

let relays = [false, false, false, false, false, false, false];
let locks = [false, false, false, false, false, false, false];

client.on("connect", () => {
  console.log("Fake ESP32 Connected");

  client.subscribe(`${BASE}/cmd/request`);

  sendStatus();
  sendRelays();
  sendSensors();

  setInterval(sendStatus, 5000);
  setInterval(sendSensors, 5000);
});

client.on("message", (topic, payload) => {
  const cmd = JSON.parse(payload.toString());

  console.log("CMD:", cmd);

  if (cmd.type === "relay_set") {
    relays[cmd.relay] = cmd.state;

    sendRelays();

    client.publish(
      `${BASE}/cmd/ack`,
      JSON.stringify({
        cmd_id: cmd.cmd_id,
        success: true,
        relay: cmd.relay,
        state: cmd.state,
        timestamp: Date.now(),
      })
    );
  }
});

function sendStatus() {
  client.publish(
    `${BASE}/live/status`,
    JSON.stringify({
      wifi: true,
      mqtt: true,
      sd_card: true,
      slave_d1: true,
      slave_pzem: true,
      uptime: Math.floor(process.uptime()),
      timestamp: Date.now(),
    })
  );
}

function sendRelays() {
  client.publish(
    `${BASE}/live/relays`,
    JSON.stringify({
      relays,
      locked: locks,
      master_lock: false,
      timestamp: Date.now(),
    })
  );
}

function sendSensors() {
  client.publish(
    `${BASE}/live/sensors`,
    JSON.stringify({
      voltage: 230 + Math.random() * 3,
      current: Math.random() * 2,
      power: Math.random() * 500,
      energy: Math.random() * 20,
      temperature: 28 + Math.random() * 5,
      humidity: 55 + Math.random() * 10,
      timestamp: Date.now(),
    })
  );
}