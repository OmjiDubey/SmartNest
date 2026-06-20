// Owns everything about inbound messages: subscribing to topics and
// deciding what happens when a message arrives.

const { getClient } = require('./client');
const { SUBSCRIBE_TOPICS } = require('./topics');

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
 * Currently just logs — this is the natural place to add parsing/routing
 * (e.g. per-topic handling, DB writes) once that phase starts.
 */
function handleMessage(topic, payloadBuffer) {
  const payload = payloadBuffer.toString();
  console.log(`[MQTT] Topic: ${topic}`);
  console.log(`[MQTT] Payload: ${payload}`);
}

module.exports = {
  subscribeTopics,
  handleMessage,
};