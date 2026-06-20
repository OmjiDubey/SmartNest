// Centralized MQTT connection config — reads from environment variables only.

require('dotenv').config();

module.exports = {
  brokerHost: process.env.MQTT_BROKER_URL,       
  port: process.env.MQTT_PORT,               
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  clientId: process.env.MQTT_CLIENT_ID || 'smartnest_backend',
  baseTopic: process.env.MQTT_BASE_TOPIC || 'smartnest',
};