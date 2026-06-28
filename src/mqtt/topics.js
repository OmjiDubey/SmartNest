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
  LIVE_SLAVES: `${BASE}/live/slaves`,     // slave states, locks, master lock, runtimes

  // ---- Commands (backend -> device on request, device -> backend on ack) ----
  CMD_REQUEST: `${BASE}/cmd/request`,     // publish: backend sends commands here
  CMD_ACK: `${BASE}/cmd/ack`,             // subscribe: device replies here (match by cmd_id)

  // ---- Historic data (device -> backend batch, backend -> device ack) ----
  HISTORY_BATCH: `${BASE}/history/batch`, // subscribe: SD-backed records for DB storage
  HISTORY_ACK: `${BASE}/history/ack`,     // publish: backend confirms storage (by batch_id)

};

// All topics the backend subscribes to on connect.
// Primary (live/cmd-ack/history) first, compatibility topics kept for migration hydration.
const SUBSCRIBE_TOPICS = [
  Topics.LIVE_STATUS,
  Topics.LIVE_SENSORS,
  Topics.LIVE_RELAYS,
  Topics.LIVE_SLAVES,
  Topics.CMD_ACK,
  Topics.HISTORY_BATCH,

];

module.exports = { Topics, SUBSCRIBE_TOPICS };