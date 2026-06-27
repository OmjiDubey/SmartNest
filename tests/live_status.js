const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const mqtt = require("mqtt");

const client = mqtt.connect(
  `mqtts://${process.env.MQTT_BROKER_URL}:${process.env.MQTT_PORT}`,
  {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    clientId: "smartnest_fake_esp32",
    clean: true,
  }
);

client.on("connect", () => {
  console.log("[TEST] Connected");

  client.publish(
    "smartnest/live/status",
    JSON.stringify({
      uptime: 12345,
      ssid: "TestWifi",
      rssi: -52,
      mqtt_status: 2,
      sd_ok: true,
      sd_total: 1000000,
      sd_used: 50000,
      digital_online: true,
      pzem_online: true,
      pzem_health: true,
      dht_ok: true,
    }),
    { qos: 0 },
    () => {
      console.log("[TEST] Status payload sent");

      setTimeout(() => {
        client.end();
        process.exit(0);
      }, 1000);
    }
  );
});