// Single source of truth for every MQTT topic used by the backend.

const { baseTopic } = require('../config/mqtt');

const BASE = baseTopic;

const Topics = {
  // ---- Subscriptions (incoming, ESP32 -> broker -> backend) ----
  RELAY_STATE_WILDCARD: `${BASE}/relay/+/state`,     // smartnest/relay/0/state
  RELAY_LOCKED_WILDCARD: `${BASE}/relay/+/locked`,   // smartnest/relay/0/locked
  SENSOR_WILDCARD: `${BASE}/sensor/#`,               // smartnest/sensor/voltage, /acs, /load, /power
  ENERGY_WILDCARD: `${BASE}/energy/#`,               // smartnest/energy/daily, /monthly, /lifetime
  SLAVE_D1_ONLINE: `${BASE}/slave/d1/online`,
  SLAVE_PZEM_ONLINE: `${BASE}/slave/pzem/online`,
  STATUS: `${BASE}/status`,

  // ---- Publishes (outgoing commands, backend -> broker -> ESP32) ----
  RELAY_SET: (index) => `${BASE}/relay/${index}/set`,       // payload: "true" | "false"
  RELAY_LOCK: (index) => `${BASE}/relay/${index}/lock`,     // payload: "true" | "false"
  CMD_SHUTDOWN: `${BASE}/cmd/shutdown`,                    // payload: "true" | "false"
  CMD_SLAVE_D1: `${BASE}/cmd/slave/d1`,                    // payload: "reboot"
  CMD_SLAVE_PZEM: `${BASE}/cmd/slave/pzem`,                // payload: "reboot" | "energy_reset"
};

// All topics the backend subscribes to on connect.
const SUBSCRIBE_TOPICS = [
  Topics.RELAY_STATE_WILDCARD,
  Topics.RELAY_LOCKED_WILDCARD,
  Topics.SENSOR_WILDCARD,
  Topics.ENERGY_WILDCARD,
  Topics.SLAVE_D1_ONLINE,
  Topics.SLAVE_PZEM_ONLINE,
  Topics.STATUS,
];

module.exports = { Topics, SUBSCRIBE_TOPICS };