// socket/events.js
// Single source of truth for Socket.IO event names.
// Mirrors the MQTT topic naming so it's obvious which live/* or cmd/*
// topic a given real-time event corresponds to.

module.exports = {
  // Server -> Client (outbound, fired from mqtt/handlers.js or controllers)
  RELAY_UPDATE: 'device:relays',     // mirrors <base>/live/relays
  SENSOR_UPDATE: 'device:sensors',   // mirrors <base>/live/sensors
  STATUS_UPDATE: 'device:status',    // mirrors <base>/live/status
  COMMAND_ACK: 'command:ack',        // mirrors <base>/cmd/ack

  // Client -> Server (inbound, handled in socket/index.js)
  CLIENT_SUBSCRIBE: 'subscribe',
  CLIENT_UNSUBSCRIBE: 'unsubscribe',
};