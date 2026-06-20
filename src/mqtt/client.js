// Owns the MQTT connection itself: connecting, reconnecting, and publishing.

const mqtt = require('mqtt');
const config = require('../config/mqtt');

let client = null;

/**
 * Connects to the HiveMQ broker and wires up lifecycle events.
 * On successful connect, delegates topic subscription to handlers.js.
 * Safe to call once at app startup.
 */
function connectMQTT() {
  const connectUrl = `mqtts://${config.brokerHost}:${config.port}`;

  client = mqtt.connect(connectUrl, {
    clientId: config.clientId,
    username: config.username,
    password: config.password,
    clean: true,
    reconnectPeriod: 5000,    // retry every 5s on disconnect
    connectTimeout: 10000,    // 10s timeout per connection attempt
    rejectUnauthorized: true, // standard TLS verification for HiveMQ Cloud
  });

  client.on('connect', () => {
    console.log(`[MQTT] Connected to broker as ${config.clientId}`);
    // Lazy require avoids a circular-import issue at module load time
    // (handlers.js requires client.js to get the connected client instance).
    const { subscribeTopics } = require('./handlers');
    subscribeTopics();
  });

  client.on('reconnect', () => {
    console.log('[MQTT] Reconnecting to broker...');
  });

  client.on('close', () => {
    console.log('[MQTT] Connection closed');
  });

  client.on('offline', () => {
    console.log('[MQTT] Client offline — broker unreachable');
  });

  client.on('error', (err) => {
    console.error('[MQTT] Connection error:', err.message);
  });

  client.on('message', (topic, payloadBuffer) => {
    const { handleMessage } = require('./handlers');
    handleMessage(topic, payloadBuffer);
  });

  return client;
}

/**
 * Returns the active MQTT client instance (or null if not yet connected).
 * Used by handlers.js to subscribe, and available for any future caller.
 */
function getClient() {
  return client;
}

/**
 * Publishes a message to any topic. Used for relay commands, reboot/shutdown, etc.
 * @param {string} topic - full MQTT topic, e.g. "smartnest/relay/0/set"
 * @param {string|object} payload - "true"/"false"/"reboot" string, or an object (will be JSON.stringify'd)
 * @param {object} options - mqtt.js publish options (qos, retain), optional
 */
function publishMessage(topic, payload, options = { qos: 0, retain: false }) {
  if (!client || !client.connected) {
    console.error(`[MQTT] Cannot publish — client not connected. Topic: ${topic}`);
    return;
  }

  const message = typeof payload === 'string' ? payload : JSON.stringify(payload);

  client.publish(topic, message, options, (err) => {
    if (err) {
      console.error(`[MQTT] Publish failed for ${topic}:`, err.message);
    } else {
      console.log(`[MQTT] Published -> Topic: ${topic} | Payload: ${message}`);
    }
  });
}

module.exports = {
  connectMQTT,
  publishMessage,
  getClient,
};