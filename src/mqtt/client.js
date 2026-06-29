// Owns the MQTT connection itself: connecting, reconnecting, and publishing.

const mqtt = require('mqtt');
const crypto = require('crypto');
const config = require('../config/mqtt');
const { Topics } = require('./topics');
const commandStateManager = require('../services/commandStateManager');

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
 * Generic publish — used for legacy/compatibility topics where the payload
 * is a plain string ("true"/"false"/"reboot") rather than a JSON command.
 * @param {string} topic - full MQTT topic, e.g. "smartnest/relay/0/set"
 * @param {string|object} payload - plain string, or object (will be JSON.stringify'd)
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

/**
 * Publishes a SmartNest command and registers it for ACK tracking.
 *
 * The command is added to CommandStateManager BEFORE publishing
 * so that a fast ACK is never missed.
 *
 * @param {object} command - Command payload
 * @returns {string} Generated (or supplied) cmd_id
 */
function publishCommand(command) {

  // Stop immediately if MQTT is unavailable
  if (!client || !client.connected) {
    throw new Error("MQTT client is not connected.");
  }

  // Generate a unique command ID if one was not supplied
  const cmd_id = command.cmd_id || crypto.randomUUID();

  const fullCommand = {
    ...command,
    cmd_id,
  };

  // Create a timeout for this command.
  // If no ACK arrives within 17 seconds, the command is marked as timed out.
  const timeoutId = setTimeout(() => {
    commandStateManager.timeout(cmd_id);
  }, 17000);

  // Register the command for future ACK matching
  commandStateManager.create({
    cmdId: cmd_id,
    command: fullCommand.command,
    payload: fullCommand,
    createdAt: new Date(),
    timeoutId,
  });

  // Publish to the SmartNest command topic
  publishMessage(
    Topics.CMD_REQUEST,
    fullCommand,
    {
      qos: 1,
      retain: false,
    }
  );

  return cmd_id;
}

module.exports = {
  connectMQTT,
  publishMessage,
  publishCommand,
  getClient,
};