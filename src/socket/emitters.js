// socket/emitters.js
// Outbound emit helpers. Call these from mqtt/handlers.js when live/*
// messages arrive, and from controllers/deviceControlController.js (or
// wherever cmd/ack is matched) when a command resolves.
//
// Kept separate from socket/index.js so handlers/controllers only need
// these small functions and never touch `io` or rooms directly.

const { getIO, roomForDevice } = require('./index');
const events = require('./events');

function emitRelayUpdate(deviceId, payload) {
  getIO().to(roomForDevice(deviceId)).emit(events.RELAY_UPDATE, {
    device: deviceId,
    ...payload,
  });
}

function emitSensorUpdate(deviceId, payload) {
  getIO().to(roomForDevice(deviceId)).emit(events.SENSOR_UPDATE, {
    device: deviceId,
    ...payload,
  });
}

function emitStatusUpdate(deviceId, payload) {
  getIO().to(roomForDevice(deviceId)).emit(events.STATUS_UPDATE, {
    device: deviceId,
    ...payload,
  });
}

function emitSlavesUpdate(deviceId, payload) {
    getIO().to(roomForDevice(deviceId)).emit(events.SLAVES_UPDATE,{
      device: deviceId,
      ...payload,
  });
}

function emitCommandAck(deviceId, ackPayload) {
  getIO().to(roomForDevice(deviceId)).emit(events.COMMAND_ACK, {
    device: deviceId,
    ...ackPayload,
  });
}

module.exports = {
  emitRelayUpdate,
  emitSensorUpdate,
  emitStatusUpdate,
  emitSlavesUpdate,
  emitCommandAck,
};