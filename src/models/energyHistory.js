const mongoose = require("mongoose");

const energyHistorySchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      index: true,
    },

    recordId: {
      type: Number,
      required: true,
    },

    epoch: {
      type: Number,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    voltage: Number,

    mainCurrent: Number,
    mainPowerW: Number,
    mainEnergyKwh: Number,

    digitalCurrent: Number,
    digitalPowerW: Number,
    digitalEnergyKwh: Number,

    acCurrent: Number,
    acPowerW: Number,
    acEnergyKwh: Number,

    runtimesSec: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate history uploads
energyHistorySchema.index(
  { deviceId: 1, recordId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "EnergyHistory",
  energyHistorySchema
);