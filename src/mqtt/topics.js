// MQTT topic structure for SmartNest
// Pattern: home/<room>/<device_id>/<action>

const TOPICS = {
  // Commands sent TO device (app → broker → ESP32)
  DEVICE_COMMAND: (deviceId) => `home/room1/${deviceId}/command`,

  // State reported BY device (ESP32 → broker → app)
  DEVICE_STATE: (deviceId) => `home/room1/${deviceId}/state`,

  // Energy readings from PZEM-004T
  ENERGY_DATA: (deviceId) => `home/room1/${deviceId}/energy`,

  // Temperature sensor readings
  TEMPERATURE: () => `home/room1/sensor/temperature`,

  // Subscribe to all room events (wildcard)
  ALL_ROOM_EVENTS: () => `home/room1/#`,
};

module.exports = TOPICS;
