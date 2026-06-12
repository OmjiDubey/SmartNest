module.exports = {
  PORT: process.env.PORT || 3000,
  MQTT_BROKER_URL: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
  MQTT_USERNAME: process.env.MQTT_USERNAME || '',
  MQTT_PASSWORD: process.env.MQTT_PASSWORD || '',
  DB_PATH: process.env.DB_PATH || './smartnest.db',
};
