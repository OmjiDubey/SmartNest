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

// ----------------------
// Device State
// ----------------------

let relayStates = [false, false, false, false, false, false, false];
let relayLocks = [false, false, false, false, false, false, false];
let relayRuntime = [0, 0, 0, 0, 0, 0, 0];

let masterLock = false;
let digitalSwitch = true;

// ----------------------
// MQTT
// ----------------------

client.on("connect", () => {
  console.log("[Simulator] Connected");

  client.subscribe(`${BASE}/cmd/request`);

  publishRelays();

  setInterval(() => {

    relayStates.forEach((state, index) => {
      if (state) relayRuntime[index]++;
    });

    publishRelays();

  }, 5000);
});

client.on("message", (topic, buffer) => {

  const command = JSON.parse(buffer.toString());

  console.log("\n======================");
  console.log("Command Received");
  console.log(command);
  console.log("======================");

  switch (command.command) {

    case "relay_set":
      return handleRelaySet(command);

    case "relay_toggle":
      return handleRelayToggle(command);

    case "relay_lock":
      return handleRelayLock(command);

    case "master_lock":
      return handleMasterLock(command);

    case "slave_reboot":
      return publishAck(command, true, "done");

    case "pzem_energy_reset":
      return publishAck(command, true, "done");

    default:
      return publishAck(command, false, "unsupported");
  }

});

// ----------------------
// Handlers
// ----------------------

function handleRelaySet(cmd) {

  const index = cmd.relay - 1;

  if (index < 0 || index > 6)
    return publishAck(cmd, false, "invalid_relay");

  if (masterLock)
    return publishAck(cmd, false, "master_locked");

  if (relayLocks[index])
    return publishAck(cmd, false, "locked");

  relayStates[index] = cmd.state;

  publishRelays();

  publishAck(cmd, true, "done");
}

function handleRelayToggle(cmd) {

  const index = cmd.relay - 1;

  if (index < 0 || index > 6)
    return publishAck(cmd, false, "invalid_relay");

  if (masterLock)
    return publishAck(cmd, false, "master_locked");

  if (relayLocks[index])
    return publishAck(cmd, false, "locked");

  relayStates[index] = !relayStates[index];

  publishRelays();

  publishAck(cmd, true, "done");
}

function handleRelayLock(cmd) {

  const index = cmd.relay - 1;

  if (index < 0 || index > 6)
    return publishAck(cmd, false, "invalid_relay");

  relayLocks[index] = cmd.locked;

  publishRelays();

  publishAck(cmd, true, "done");
}

function handleMasterLock(cmd) {

  masterLock = cmd.state;

  publishRelays();

  publishAck(cmd, true, "done");
}

// ----------------------
// Publishers
// ----------------------

function publishRelays() {

  const payload = {

    states: relayStates,

    locks: relayLocks,

    runtime_sec: relayRuntime,

    master_lock: masterLock,

    digital_switch: digitalSwitch,
  };

  client.publish(
    `${BASE}/live/relays`,
    JSON.stringify(payload),
    { qos: 0 }
  );

  console.log("\n[Simulator] Relay State");
  console.table(
    relayStates.map((state, i) => ({
      Relay: i + 1,
      State: state,
      Locked: relayLocks[i],
      Runtime: relayRuntime[i],
    }))
  );
}

function publishAck(command, ok, reason) {

  const ack = {

    cmd_id: command.cmd_id,

    command: command.command,

    ok,

    reason,

    relay: command.relay,

    state: command.state,

    locked: command.locked,
  };

  client.publish(
    `${BASE}/cmd/ack`,
    JSON.stringify(ack),
    { qos: 1 }
  );

  console.log("[Simulator] ACK Published");
  console.log(ack);
}

client.on("error", (err) => {
  console.error(err);
});

client.on("close", () => {
  console.log("[Simulator] Disconnected");
});