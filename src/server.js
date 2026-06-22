require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { connectMQTT } = require('./mqtt/client');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectDB();

    await connectMQTT();

    app.listen(PORT, () => {
      console.log(`SmartNest backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
