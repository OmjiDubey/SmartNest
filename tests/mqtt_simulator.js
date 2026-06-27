const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const mqtt = require("mqtt");

const client = mqtt.connect(
  `mqtts://${process.env.MQTT_BROKER_URL}:${process.env.MQTT_PORT}`,
  {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    clientId: "smartnest_fake_esp32",
    clean: true,
  }
);

const BASE = process.env.MQTT_BASE_TOPIC;

let relayStates = [false, false, false, false, false, false, false];
let relayLocks = [false, false, false, false, false, false, false];
let relayRuntime = [0, 0, 0, 0, 0, 0, 0];

client.on("connect", () => {
  console.log("[Simulator] Fake ESP32 Connected");

  client.subscribe(`${BASE}/cmd/request`);
  client.subscribe(`${BASE}/cmd/ack`);

  // Publish initial device state
  publishStatus();
  publishSensors();
  publishRelays();

  // Simulate live updates every 10 seconds
  setInterval(publishStatus, 10000);
  setInterval(publishSensors, 10000);
  setInterval(publishRelays, 10000);
});

client.on("message", (topic, payloadBuffer) => {
  const command = JSON.parse(payloadBuffer.toString());

  console.log("\n[Simulator] Command Received");
  console.log(command);

  switch (command.type) {

    case "relay_set": {

      const index = command.relay - 1;

      if (index < 0 || index > 6) {
        publishAck(command, false, "invalid_relay");
        return;
      }

      if (relayLocks[index]) {
        publishAck(command, false, "locked");
        return;
      }

      relayStates[index] = command.state;

      publishRelays();

      publishAck(command, true, "done");

      break;
    }

    default:
      publishAck(command, false, "unsupported");
  }
});

/**
 * Publishes live status.
 */
function publishStatus() {

  client.publish(
    `${BASE}/live/status`,
    JSON.stringify({
      uptime: Math.floor(process.uptime()),

      ssid: "SmartNest_Test_WiFi",
      rssi: -48,

      mqtt_status: 2,

      sd_ok: true,
      sd_total: 32000000000,
      sd_used: 15000000,

      digital_online: true,
      pzem_online: true,
      pzem_health: true,
      dht_ok: true,
    })
  );
}

/**
 * Publishes live sensor readings.
 */
function publishSensors() {

  client.publish(
    `${BASE}/live/sensors`,
    JSON.stringify({
      voltage: 230.4,

      main_current: 1.12,
      digital_current: 0.34,
      ac_current: 1.46,

      ac_power: 336,

      ac_energy_kwh: 8.51,
      main_energy_kwh: 1.82,
      digital_energy_kwh: 0.42,

      temperature_c: 29.4,
      humidity_pct: 61.2,
    })
  );
}

/**
 * Publishes current relay state.
 */
function publishRelays() {

  client.publish(
    `${BASE}/live/relays`,
    JSON.stringify({
      states: relayStates,
      locks: relayLocks,
      runtime: relayRuntime,

      master_lock: false,
      digital_switch: false,
    })
  );
}

/**
 * Publishes a command acknowledgement back to the backend.
 */
function publishAck(command, ok, reason) {

  const ack = {
    cmd_id: command.cmd_id,
    type: command.type,
    ok,
    reason,
    relay: command.relay,
    state: command.state,
    locked: relayLocks[command.relay - 1] ?? false,
  };

  console.log("Publishing ACK to:", `${BASE}/cmd/ack`);

  client.publish(
    `${BASE}/cmd/ack`,
    JSON.stringify(ack),
    { qos: 1 },
    (err) => {

      if (err) {
        console.error("[Simulator] Failed to publish ACK:", err.message);
        return;
      }

      console.log(
        `[Simulator] ACK Published -> ${ack.cmd_id}`
      );
    }
  );
}