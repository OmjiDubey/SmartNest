// ==============================
// SmartNest Backend Simulator
// Chunk 1/7
// ==============================

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

// ======================================================
// Device State
// ======================================================

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

// ======================================================
// AC State
// ======================================================

let ac = {
  power: false,
  temperature: 24,
  fan: "auto",
};

// ======================================================
// Sensor State
// ======================================================

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

// ======================================================
// Helpers
// ======================================================

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function timestamp() {
  return new Date().toLocaleTimeString();
}

// ======================================================
// Console Dashboard
// ======================================================

function printRelayTable() {
  console.table(
    relayStates.map((state, i) => ({
      Relay: i + 1,
      State: state ? "ON" : "OFF",
      Locked: relayLocks[i],
      Runtime: relayRuntime[i] + " s",
    }))
  );
}

function printDashboard() {
  console.clear();

  console.log("======================================================");
  console.log("              SMARTNEST DEVICE SIMULATOR");
  console.log("======================================================");

  console.log(
    `Time       : ${timestamp()}`
  );

  console.log(
    `Uptime     : ${(uptime / 1000).toFixed(0)} sec`
  );

  console.log(
    `WiFi       : ${wifi.ssid} (${wifi.rssi} dBm)`
  );

  console.log(
    `Digital    : ${digitalOnline ? "ONLINE" : "OFFLINE"}`
  );

  console.log(
    `PZEM       : ${pzemOnline ? "ONLINE" : "OFFLINE"}`
  );

  console.log(
    `AC         : ${ac.power ? "ON" : "OFF"} | ${ac.temperature}°C | ${ac.fan}`
  );

  console.log("");

  console.table([
    {
      Voltage: voltage.toFixed(1),
      Main_A: mainCurrent.toFixed(2),
      Digital_A: digitalCurrent.toFixed(2),
      AC_A: acCurrent.toFixed(2),
      AC_W: acPower.toFixed(1),
      Temp: temperature.toFixed(1),
      Humidity: humidity.toFixed(1),
    },
  ]);

  printRelayTable();
}
// ==============================
// SmartNest Backend Simulator
// Chunk 2/7
// MQTT Publishers
// ==============================

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
}

function publishSensors() {
  client.publish(
    `${BASE}/live/sensors`,
    JSON.stringify({
      voltage,

      main_current: +mainCurrent.toFixed(2),
      digital_current: +digitalCurrent.toFixed(2),
      ac_current: +acCurrent.toFixed(2),

      ac_power: +acPower.toFixed(2),

      ac_energy_kwh: +acEnergy.toFixed(3),

      pzem_cumulative_energy_kwh: +pzemCumulative.toFixed(3),

      ac_day_start_kwh: +acDayStart.toFixed(3),

      main_energy_kwh: +mainEnergy.toFixed(3),

      digital_energy_kwh: +digitalEnergy.toFixed(3),

      temperature_c: +temperature.toFixed(1),

      humidity_pct: +humidity.toFixed(1),
    }),
    { qos: 0 }
  );
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
}

function publishAllLiveTopics() {
  publishStatus();
  publishSensors();
  publishRelays();
  publishSlaves();

  printDashboard();
}

// =====================================
// ACK Publisher
// =====================================

function publishAck(command, ok, message) {
  const ack = {
    cmd_id: command.cmd_id,
    command: command.command,
    ok,
    message,
    timestamp: Math.floor(Date.now() / 1000),
  };

  client.publish(
    `${BASE}/cmd/ack`,
    JSON.stringify(ack),
    {
      qos: 1,
      retain: false,
    }
  );

  console.log("\n============= ACK =============");
  console.log(ack);
}

// =====================================
// MQTT Connection
// =====================================

client.on("connect", () => {
  console.log("\n[Simulator] Connected");

  client.subscribe(`${BASE}/cmd/request`, (err) => {
    if (err) {
      console.error("[Simulator] Subscribe Error:", err.message);
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
  } catch {
    return console.log("[Simulator] Invalid JSON");
  }

  console.log("\n============= COMMAND =============");
  console.log(command);

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
        "unsupported command"
      );
  }
});
// ==============================
// SmartNest Backend Simulator
// Chunk 3/7
// Command Handlers
// ==============================

function handleRelaySet(cmd) {
  const index = cmd.relay - 1;

  if (index < 0 || index > 6)
    return publishAck(cmd, false, "invalid relay");

  if (masterLock)
    return publishAck(cmd, false, "master lock enabled");

  if (relayLocks[index])
    return publishAck(cmd, false, `relay ${cmd.relay} locked`);

  relayStates[index] = cmd.state;

  publishRelays();

  publishAck(
    cmd,
    true,
    `relay ${cmd.relay} ${cmd.state ? "ON" : "OFF"}`
  );
}

function handleRelayLock(cmd) {
  const index = cmd.relay - 1;

  if (index < 0 || index > 6)
    return publishAck(cmd, false, "invalid relay");

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
    `lights ${cmd.state ? "ON" : "OFF"}`
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
    "all relays OFF"
  );
}

function handleUnlockAllRelays(cmd) {

  relayLocks.fill(false);

  masterLock = false;

  publishRelays();

  publishAck(
    cmd,
    true,
    "all relays unlocked"
  );
}

function handleSystemReboot(cmd) {

  uptime = 0;

  relayRuntime.fill(0);

  publishAllLiveTopics();

  publishAck(
    cmd,
    true,
    "system reboot completed"
  );
}

function handleAcSet(cmd) {

  if (cmd.power !== undefined) {
    ac.power = cmd.power;
  }

  if (cmd.temp !== undefined) {
    ac.temperature = clamp(cmd.temp, 16, 30);
  }

  if (cmd.temp_step !== undefined) {

    if (cmd.temp_step === "up")
      ac.temperature++;

    if (cmd.temp_step === "down")
      ac.temperature--;

    ac.temperature = clamp(
      ac.temperature,
      16,
      30
    );
  }

  if (cmd.fan !== undefined) {
    ac.fan = cmd.fan;
  }

  publishAck(
    cmd,
    true,
    "AC command applied"
  );
}
// ==============================
// SmartNest Backend Simulator
// Chunk 4/7
// Simulation Loop
// ==============================

setInterval(() => {

  uptime += 5000;

  // -----------------------------
  // Relay Runtime
  // -----------------------------

  relayStates.forEach((state, index) => {

    if (state) {
      relayRuntime[index] += 5;
    }

  });

  // -----------------------------
  // Sensor Simulation
  // -----------------------------

  voltage = clamp(
    voltage + random(-0.3, 0.3),
    225,
    235
  );

  mainCurrent = clamp(
    mainCurrent + random(-0.05, 0.05),
    0,
    15
  );

  digitalCurrent = clamp(
    digitalCurrent + random(-0.03, 0.03),
    0,
    5
  );

  acCurrent = ac.power
    ? clamp(
        acCurrent + random(-0.05, 0.05),
        0.5,
        10
      )
    : 0;

  acPower = +(voltage * acCurrent).toFixed(2);

  temperature = clamp(
    temperature + random(-0.2, 0.2),
    20,
    40
  );

  humidity = clamp(
    humidity + random(-0.5, 0.5),
    20,
    90
  );

  // -----------------------------
  // Energy Accumulation
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
  // -----------------------------

  wifi.rssi = clamp(
    wifi.rssi + Math.round(random(-1, 1)),
    -70,
    -40
  );

  // -----------------------------
  // Slave Simulation
  // -----------------------------

  if (Math.random() < 0.02)
    digitalOnline = !digitalOnline;

  if (Math.random() < 0.02)
    pzemOnline = !pzemOnline;

  publishAllLiveTopics();

}, 5000);
// ==============================
// SmartNest Backend Simulator
// Chunk 5/7
// MQTT Events
// ==============================

client.on("offline", () => {
  console.log("\n[Simulator] MQTT Offline");
});

client.on("reconnect", () => {
  console.log("\n[Simulator] Reconnecting...");
});

client.on("close", () => {
  console.log("\n[Simulator] Connection Closed");
});

client.on("error", (err) => {
  console.error("\n[Simulator] Error:", err.message);
});

// ==============================
// Graceful Shutdown
// ==============================

process.on("SIGINT", () => {

  console.log("\n");
  console.log("========================================");
  console.log("Stopping SmartNest Simulator...");
  console.log("========================================");

  client.end(true, () => {
    console.log("MQTT Disconnected");
    process.exit(0);
  });

});

// ==============================
// Initial Dashboard
// ==============================

setTimeout(() => {
  printDashboard();
}, 1000);
// ==============================
// SmartNest Backend Simulator
// Chunk 6/7
// Utility Commands (Optional)
// ==============================

// Press Ctrl + C to stop the simulator.

// Optional: publish all topics manually from the Node.js REPL
global.publishAll = () => {
  publishAllLiveTopics();
  console.log("[Simulator] All live topics published.");
};

// Optional: reset simulator state
global.resetSimulator = () => {
  relayStates.fill(false);
  relayLocks.fill(false);
  relayRuntime.fill(0);

  masterLock = false;
  digitalSwitch = true;

  uptime = 0;

  ac = {
    power: false,
    temperature: 24,
    fan: "auto",
  };

  acEnergy = 1.210;
  mainEnergy = 2.780;
  digitalEnergy = 0.510;
  pzemCumulative = 10.320;

  publishAllLiveTopics();

  console.log("[Simulator] Simulator state reset.");
};

// Optional: force publish only relay state
global.publishRelays = () => {
  publishRelays();
};

// Optional: force publish only status
global.publishStatus = () => {
  publishStatus();
};

// Optional: force publish only sensors
global.publishSensors = () => {
  publishSensors();
};

// Optional: force publish only slaves
global.publishSlaves = () => {
  publishSlaves();
};

console.log("\n========================================");
console.log(" SmartNest Backend Simulator Started");
console.log("========================================");
console.log("Available helper commands:");
console.log("  publishAll()");
console.log("  publishRelays()");
console.log("  publishStatus()");
console.log("  publishSensors()");
console.log("  publishSlaves()");
console.log("  resetSimulator()");
console.log("========================================");

module.exports = {};