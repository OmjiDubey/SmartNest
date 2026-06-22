// Owns everything about inbound messages: subscribing to topics and
// deciding what happens when a message arrives. No business logic yet —
// just logging, per current project phase. JSON topics are parsed for
// readable logs; legacy compatibility topics stay as raw strings.

const { getClient } = require('./client');
const { Topics, SUBSCRIBE_TOPICS } = require('./topics');

// Topics whose payload is JSON per the SmartNest MQTT Guide.
// Used only to decide how to format logs — no further processing yet.
const JSON_TOPICS = new Set([
  Topics.LIVE_STATUS,
  Topics.LIVE_SENSORS,
  Topics.LIVE_RELAYS,
  Topics.CMD_ACK,
  Topics.HISTORY_BATCH,
]);

/**
 * Subscribes to every topic defined in SUBSCRIBE_TOPICS.
 * Called automatically by client.js once the connection is established.
 */
function subscribeTopics() {
  const client = getClient();

  if (!client) {
    console.error('[MQTT] subscribeTopics() called before the client was connected');
    return;
  }

  SUBSCRIBE_TOPICS.forEach((topic) => {
    client.subscribe(topic, { qos: 0 }, (err) => {
      if (err) {
        console.error(`[MQTT] Failed to subscribe to ${topic}:`, err.message);
      } else {
        console.log(`[MQTT] Subscribed to ${topic}`);
      }
    });
  });
}

/**
 * Called by client.js for every incoming message, regardless of topic.
 * Currently just logs — this is the natural place to add real handling later:
 *   - <base>/live/relays|sensors|status -> update in-memory/DB current state
 *   - <base>/cmd/ack -> match cmd_id, resolve a pending command promise / notify API caller
 *   - <base>/history/batch -> store records, then publishMessage(Topics.HISTORY_ACK, { batch_id, ok: true, last_id })
 */
function handleMessage(topic, payloadBuffer) {
  const raw = payloadBuffer.toString();

  console.log(`[MQTT] Topic: ${topic}`);

  if (JSON_TOPICS.has(topic)) {
    try {
      const parsed = JSON.parse(raw);
      console.log('[MQTT] Payload (JSON):', parsed);
    } catch (err) {
      console.error(`[MQTT] Expected JSON on ${topic} but failed to parse:`, err.message);
      console.log(`[MQTT] Raw payload: ${raw}`);
    }
  } else {
    // Legacy/compatibility topics: plain string payloads (true/false/reboot/etc.)
    console.log(`[MQTT] Payload: ${raw}`);
  }
}

module.exports = {
  subscribeTopics,
  handleMessage,
};