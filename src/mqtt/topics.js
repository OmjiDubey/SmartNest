// Single source of truth for every MQTT topic used by the backend.
// Structure follows the SmartNest MQTT Guide: live data / commands / history,
// with old flat topics kept only as compatibility topics for migration.

const { baseTopic } = require('../config/mqtt');

const BASE = baseTopic;

const Topics = {
  // ---- Live data (device -> backend, no ACK, volatile) ----
  LIVE_STATUS: `${BASE}/live/status`,     // device/WiFi/MQTT/SD/slave/sensor health
  LIVE_SENSORS: `${BASE}/live/sensors`,   // voltage, currents, power, energy, temp, humidity
  LIVE_RELAYS: `${BASE}/live/relays`,     // relay states, locks, master lock, runtimes

  // ---- Commands (backend -> device on request, device -> backend on ack) ----
  CMD_REQUEST: `${BASE}/cmd/request`,     // publish: backend sends commands here
  CMD_ACK: `${BASE}/cmd/ack`,             // subscribe: device replies here (match by cmd_id)

  // ---- Historic data (device -> backend batch, backend -> device ack) ----
  HISTORY_BATCH: `${BASE}/history/batch`, // subscribe: SD-backed records for DB storage
  HISTORY_ACK: `${BASE}/history/ack`,     // publish: backend confirms storage (by batch_id)

  // ---- Compatibility topics (kept for migration / initial UI hydration only) ----
  RELAY_STATE_WILDCARD: `${BASE}/relay/+/state`,     // smartnest/relay/0/state .. /6/state
  RELAY_LOCKED_WILDCARD: `${BASE}/relay/+/locked`,   // smartnest/relay/0/locked .. /6/locked
  SLAVE_D1_ONLINE: `${BASE}/slave/d1/online`,
  SLAVE_PZEM_ONLINE: `${BASE}/slave/pzem/online`,
  SENSOR_WILDCARD: `${BASE}/sensor/#`,               // voltage, acs, load, power, ac_current, ac_energy, temperature, humidity, dht_ok
  SWITCH_WILDCARD: `${BASE}/switch/#`,               // switch/6/state
  STATUS_LEGACY: `${BASE}/status`,                   // old basic heartbeat (pre live/status)

  // Legacy command builders/topics — still accepted by device during migration.
  RELAY_SET: (index) => `${BASE}/relay/${index}/set`,       // payload: "true" | "false"
  RELAY_LOCK: (index) => `${BASE}/relay/${index}/lock`,     // payload: "true" | "false"
  CMD_SLAVE_D1_LEGACY: `${BASE}/cmd/slave/d1`,             // payload: "reboot"
  CMD_SLAVE_PZEM_LEGACY: `${BASE}/cmd/slave/pzem`,         // payload: "reboot" | "energy_reset"
};

// All topics the backend subscribes to on connect.
// Primary (live/cmd-ack/history) first, compatibility topics kept for migration hydration.
const SUBSCRIBE_TOPICS = [
  Topics.LIVE_STATUS,
  Topics.LIVE_SENSORS,
  Topics.LIVE_RELAYS,
  Topics.CMD_ACK,
  Topics.HISTORY_BATCH,

  Topics.RELAY_STATE_WILDCARD,
  Topics.RELAY_LOCKED_WILDCARD,
  Topics.SLAVE_D1_ONLINE,
  Topics.SLAVE_PZEM_ONLINE,
  Topics.SENSOR_WILDCARD,
  Topics.SWITCH_WILDCARD,
  Topics.STATUS_LEGACY,
];

module.exports = { Topics, SUBSCRIBE_TOPICS };