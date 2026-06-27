// socket/index.js
// Owns Socket.IO connection lifecycle: init, auth, room subscription.
// Mirrors mqtt/client.js's role for the MQTT side (connection ownership).

const { Server } = require('socket.io');
const socketAuthMiddleware = require('./authMiddleware');
const events = require('./events');

let io;

function roomForDevice(deviceId) {
  return `device:${deviceId}`;
}

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (user: ${socket.user?.username || 'unknown'})`);

    socket.on(events.CLIENT_SUBSCRIBE, (deviceId) => {
      if (!deviceId) return;
      socket.join(roomForDevice(deviceId));
      console.log(`Socket ${socket.id} subscribed to ${deviceId}`);
    });

    socket.on(events.CLIENT_UNSUBSCRIBE, (deviceId) => {
      if (!deviceId) return;
      socket.leave(roomForDevice(deviceId));
      console.log(`Socket ${socket.id} unsubscribed from ${deviceId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.IO has not been initialized.');
  }
  return io;
}

module.exports = {
  initSocket,
  getIO,
  roomForDevice,
};