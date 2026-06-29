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
    reconnectPeriod: 5000,
  }
);

const BASE = process.env.MQTT_BASE_TOPIC;

// ------------------------------------------------------
// Simulated Device State
// ------------------------------------------------------

let relayStates = Array(7).fill(false);
let relayLocks = Array(7).fill(false);
let relayRuntime = Array(7).fill(0);

let masterLock = false;
let digitalSwitch = true;

let uptime = 0;

let wifi = {
  ssid: "SmartNest_Test",
  rssi: -52,
};

let sd = {
  ok: true,
  total: 32 * 1024 * 1024 * 1024,
  used: 14 * 1024 * 1024,
};

let digitalOnline = true;
let pzemOnline = true;
let pzemHealth = true;
let dhtOk = true;

let voltageEstimated = false;
let timeSource = "NTP";
let resetReason = "POWERON";

// ---------------------
// Sensor values
// ---------------------

let voltage = 230.2;

let mainCurrent = 0.85;
let digitalCurrent = 0.32;
let acCurrent = 0.47;

let acPower = 108.1;

let acEnergy = 1.210;
let mainEnergy = 2.780;
let digitalEnergy = 0.510;

let pzemCumulative = 10.320;
let acDayStart = 9.110;

let temperature = 29.6;
let humidity = 57.2;

// ------------------------------------------------------
// Publishers
// ------------------------------------------------------

function publishStatus() {
  client.publish(
    `${BASE}/live/status`,
    JSON.stringify({
      uptime,

      ssid: wifi.ssid,
      rssi: wifi.rssi,

      mqtt_status: 2,

      sd_ok: sd.ok,
      sd_total: sd.total,
      sd_used: sd.used,

      digital_online: digitalOnline,
      pzem_online: pzemOnline,
      pzem_health: pzemHealth,

      dht_ok: dhtOk,

      voltage_estimated: voltageEstimated,

      time_source: timeSource,

      reset_reason: resetReason,
    }),
    { qos: 0 }
  );

  console.log("[Simulator] Published STATUS");
}

function publishSensors() {
  client.publish(
    `${BASE}/live/sensors`,
    JSON.stringify({
      voltage,

      main_current: mainCurrent,
      digital_current: digitalCurrent,
      ac_current: acCurrent,

      ac_power: acPower,

      ac_energy_kwh: acEnergy,

      pzem_cumulative_energy_kwh: pzemCumulative,

      ac_day_start_kwh: acDayStart,

      main_energy_kwh: mainEnergy,

      digital_energy_kwh: digitalEnergy,

      temperature_c: temperature,

      humidity_pct: humidity,
    }),
    { qos: 0 }
  );

  console.log("[Simulator] Published SENSORS");
}

function publishRelays() {
  client.publish(
    `${BASE}/live/relays`,
    JSON.stringify({
      states: relayStates,

      locks: relayLocks,

      master_lock: masterLock,

      digital_switch: digitalSwitch,

      runtime_sec: relayRuntime,
    }),
    { qos: 0 }
  );

  console.log("[Simulator] Published RELAYS");
}

function publishSlaves() {
  client.publish(
    `${BASE}/live/slaves`,
    JSON.stringify({
      digital_board: {
        online: digitalOnline,
        rssi: -48,
        last_seen_sec_ago: 1,
      },

      pzem: {
        online: pzemOnline,
        rssi: -63,
        last_seen_sec_ago: 2,
      },
    }),
    { qos: 0 }
  );

  console.log("[Simulator] Published SLAVES");
}

function publishAllLiveTopics() {
  publishStatus();
  publishSensors();
  publishRelays();
  publishSlaves();
}
// ------------------------------------------------------
// MQTT Connection
// ------------------------------------------------------

client.on("connect", () => {
  console.log("[Simulator] Connected");

  client.subscribe(`${BASE}/cmd/request`, (err) => {
    if (err) {
      console.error("[Simulator] Subscribe failed:", err.message);
      return;
    }

    console.log("[Simulator] Listening for commands...");
  });

  publishAllLiveTopics();
});

client.on("message", (topic, buffer) => {
  let command;

  try {
    command = JSON.parse(buffer.toString());
  } catch (err) {
    console.error("[Simulator] Invalid JSON");
    return;
  }

  console.log("\n==============================");
  console.log("COMMAND RECEIVED");
  console.log(command);
  console.log("==============================");

  switch (command.command) {
    case "relay_set":
      return handleRelaySet(command);

    case "relay_lock":
      return handleRelayLock(command);

    case "lights_set":
      return handleLightsSet(command);

    case "all_relays_off":
      return handleAllRelaysOff(command);

    case "unlock_all_relays":
      return handleUnlockAllRelays(command);

    case "system_reboot":
      return handleSystemReboot(command);

    case "ac_set":
      return handleAcSet(command);

    default:
      return publishAck(
        command,
        false,
        "unknown MQTT command"
      );
  }
});

// ------------------------------------------------------
// ACK Publisher
// ------------------------------------------------------

function publishAck(command, ok, message) {

  client.publish(
    `${BASE}/cmd/ack`,
    JSON.stringify({
      cmd_id: command.cmd_id,
      command: command.command,
      ok,
      message,
      timestamp: Math.floor(Date.now() / 1000),
    }),
    {
      qos: 1,
      retain: false,
    }
  );

  console.log("[Simulator] ACK Published");
}

// ------------------------------------------------------
// Command Handlers
// ------------------------------------------------------

function handleRelaySet(cmd) {

  const index = cmd.relay - 1;

  if (index < 0 || index > 6)
    return publishAck(cmd, false, "invalid relay number");

  if (masterLock)
    return publishAck(cmd, false, "master lock enabled");

  if (relayLocks[index])
    return publishAck(
      cmd,
      false,
      `relay ${cmd.relay} is locked`
    );

  relayStates[index] = cmd.state;

  publishRelays();

  publishAck(
    cmd,
    true,
    `relay ${cmd.relay} set to ${cmd.state ? "ON" : "OFF"}`
  );
}

function handleRelayLock(cmd) {

  const index = cmd.relay - 1;

  if (index < 0 || index > 6)
    return publishAck(cmd, false, "invalid relay number");

  relayLocks[index] = cmd.locked;

  publishRelays();

  publishAck(
    cmd,
    true,
    `relay ${cmd.relay} ${cmd.locked ? "locked" : "unlocked"}`
  );
}

function handleLightsSet(cmd) {

  for (let i = 0; i < 5; i++) {

    if (!relayLocks[i]) {
      relayStates[i] = cmd.state;
    }

  }

  publishRelays();

  publishAck(
    cmd,
    true,
    `relay 1 to relay 5 set to ${cmd.state ? "ON" : "OFF"}`
  );
}

function handleAllRelaysOff(cmd) {

  relayStates = relayStates.map((state, index) =>
    relayLocks[index] ? state : false
  );

  publishRelays();

  publishAck(
    cmd,
    true,
    "all controllable relays turned OFF"
  );
}

function handleUnlockAllRelays(cmd) {

  relayLocks.fill(false);

  masterLock = false;

  publishRelays();

  publishAck(
    cmd,
    true,
    "all relay locks cleared"
  );
}

function handleSystemReboot(cmd) {

  publishAck(
    cmd,
    true,
    "system reboot accepted; reboot sequence started"
  );
}

function handleAcSet(cmd) {

  publishAck(
    cmd,
    true,
    "ac command accepted"
  );
}
// ------------------------------------------------------
// Simulation Loop
// ------------------------------------------------------

setInterval(() => {

  uptime += 5000;

  // -----------------------------
  // Relay runtime
  // -----------------------------

  relayStates.forEach((state, index) => {

    if (state) {
      relayRuntime[index] += 5;
    }

  });

  // -----------------------------
  // Simulate sensor fluctuations
  // -----------------------------

  voltage += random(-0.30, 0.30);

  mainCurrent = clamp(
    mainCurrent + random(-0.05, 0.05),
    0,
    10
  );

  digitalCurrent = clamp(
    digitalCurrent + random(-0.03, 0.03),
    0,
    5
  );

  acCurrent = clamp(
    acCurrent + random(-0.04, 0.04),
    0,
    15
  );

  acPower = +(voltage * acCurrent).toFixed(2);

  temperature += random(-0.2, 0.2);

  humidity = clamp(
    humidity + random(-0.5, 0.5),
    20,
    95
  );

  // -----------------------------
  // Energy accumulation
  // -----------------------------

  acEnergy += acPower / 3600000;

  mainEnergy +=
    (voltage * mainCurrent) / 3600000;

  digitalEnergy +=
    (voltage * digitalCurrent) / 3600000;

  pzemCumulative =
    acDayStart + acEnergy;

  // -----------------------------
  // WiFi RSSI

  wifi.rssi += Math.round(
    random(-1, 1)
  );

  wifi.rssi = clamp(
    wifi.rssi,
    -70,
    -40
  );

  // -----------------------------
  // Occasionally toggle slave status
  // -----------------------------

  if (Math.random() < 0.02) {
    digitalOnline = !digitalOnline;
  }

  if (Math.random() < 0.02) {
    pzemOnline = !pzemOnline;
  }

  publishAllLiveTopics();

}, 5000);

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------

function random(min, max) {

  return Math.random() * (max - min) + min;

}

function clamp(value, min, max) {

  return Math.min(
    Math.max(value, min),
    max
  );

}

// ------------------------------------------------------
// MQTT Events
// ------------------------------------------------------

client.on("error", (err) => {

  console.error(
    "[Simulator]",
    err.message
  );

});

client.on("offline", () => {

  console.log(
    "[Simulator] Offline"
  );

});

client.on("reconnect", () => {

  console.log(
    "[Simulator] Reconnecting..."
  );

});

client.on("close", () => {

  console.log(
    "[Simulator] Connection closed"
  );

});

// ------------------------------------------------------
// Graceful shutdown
// ------------------------------------------------------

process.on("SIGINT", () => {

  console.log(
    "\n[Simulator] Shutting down..."
  );

  client.end(true, () => {

    process.exit(0);

  });

});