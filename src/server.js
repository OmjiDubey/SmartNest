require('dotenv').config();

const http = require('http');

const app = require('./app');
const connectDB = require('./config/db');
const { connectMQTT } = require('./mqtt/client');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

initSocket(server);

async function start() {
  try {
    // Database
    await connectDB();

    // MQTT
    await connectMQTT();

    // REST + Socket.IO
    server.listen(PORT, () => {
      console.log(`SmartNest backend running on port ${PORT}`);
      console.log(`REST API : http://localhost:${PORT}`);
      console.log(`Socket.IO: ws://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();