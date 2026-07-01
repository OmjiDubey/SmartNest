const { publishCommand } = require("../mqtt/client");
const deviceStateManager = require("../services/deviceStateManager");

exports.setRelayState = async (req, res) => {
  try {
    const relay = Number(req.params.relayNo);
    const { state } = req.body;

    if (!Number.isInteger(relay) || relay < 1 || relay > 7) {
      return res.status(400).json({
        success: false,
        error: "INVALID_RELAY",
        message: "Relay number must be between 1 and 7.",
      });
    }

    if (typeof state !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "INVALID_STATE",
        message: "'state' must be a boolean.",
      });
    }

    const cmd_id = publishCommand({
      command: "relay_set",
      relay,
      state,
    });

    return res.status(202).json({
      success: true,
      cmd_id,
      status: "pending",
    });

  } catch (err) {
    console.error("[DeviceController] setRelayState:", err);

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: err.message,
    });
  }
};

exports.getRelays = (req, res) => {
  try {
    const relays = deviceStateManager.getRelays();

    const data = {
      states: relays.items.map((r) => r.state),
      locks: relays.items.map((r) => r.locked),
      masterLock: relays.masterLock,
      digitalSwitch: relays.digitalSwitch,
      runtimeSec: relays.items.map((r) => r.runtimeSec),
    };

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (err) {
    console.error("[DeviceController] getRelays:", err);

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: err.message,
    });
  }
};

exports.toggleRelay = async (req, res) => {
  try {
    const relay = Number(req.params.relayNo);

    if (!Number.isInteger(relay) || relay < 1 || relay > 7) {
      return res.status(400).json({
        success: false,
        error: "INVALID_RELAY",
        message: "Relay number must be between 1 and 7.",
      });
    }

    const cmd_id = publishCommand({
      command: "relay_toggle",
      relay,
    });

    return res.status(202).json({
      success: true,
      data: {
        deviceId: req.params.deviceId,
        cmd_id,
        status: "pending",
      },
    });

  } catch (err) {
    console.error("[DeviceController] toggleRelay:", err);

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: err.message,
    });
  }
};

exports.setRelayLock = async (req, res) => {
  try {
    const relay = Number(req.params.relayNo);
    const { locked } = req.body;

    // Validate relay number
    if (!Number.isInteger(relay) || relay < 1 || relay > 7) {
      return res.status(400).json({
        success: false,
        error: "INVALID_RELAY",
        message: "Relay number must be between 1 and 7.",
      });
    }

    // Validate lock state
    if (typeof locked !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "INVALID_LOCK_STATE",
        message: "'locked' must be a boolean.",
      });
    }

    // Publish MQTT command
    const cmd_id = publishCommand({
      command: "relay_lock",
      relay,
      locked,
    });

    return res.status(202).json({
      success: true,
      data: {
        deviceId: req.params.deviceId,
        cmd_id,
        status: "pending",
      },
    });

  } catch (err) {
    console.error("[DeviceController] setRelayLock:", err);

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: err.message,
    });
  }
};

exports.setMasterLock = async (req, res) => {
  try {
    const { state } = req.body;

    if (typeof state !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "INVALID_STATE",
        message: "'state' must be a boolean.",
      });
    }

    const cmd_id = publishCommand({
      command: "master_lock",
      state,
    });

    return res.status(202).json({
      success: true,
      data: {
        deviceId: req.params.deviceId,
        cmd_id,
        status: "pending",
      },
    });

  } catch (err) {
    console.error("[DeviceController] setMasterLock:", err);

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: err.message,
    });
  }
};

exports.rebootSlave = async (req, res) => {
  try {
    const { target } = req.body;

    const allowedTargets = ["digital", "pzem"];

    if (!allowedTargets.includes(target)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_TARGET",
        message: "Target must be either 'digital' or 'pzem'.",
      });
    }

    const cmd_id = publishCommand({
      command: "slave_reboot",
      target,
    });

    return res.status(202).json({
      success: true,
      data: {
        deviceId: req.params.deviceId,
        cmd_id,
        status: "pending",
      },
    });

  } catch (err) {
    console.error("[DeviceController] rebootSlave:", err);

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: err.message,
    });
  }
};

exports.resetPzemEnergy = async (req, res) => {
  try {
    const cmd_id = publishCommand({
      command: "pzem_energy_reset",
    });

    return res.status(202).json({
      success: true,
      data: {
        deviceId: req.params.deviceId,
        cmd_id,
        status: "pending",
      },
    });

  } catch (err) {
    console.error("[DeviceController] resetPzemEnergy:", err);

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: err.message,
    });
  }
};

exports.setLights = async (req, res) => {
  try {
    const { state } = req.body;

    if (typeof state !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "INVALID_STATE",
        message: "'state' must be a boolean.",
      });
    }

    const cmd_id = publishCommand({
      command: "lights_set",
      state,
    });

    return res.status(202).json({
      success: true,
      data: {
        deviceId: req.params.deviceId,
        cmd_id,
        status: "pending",
      },
    });

  } catch (err) {
    console.error("[DeviceController] setLights:", err);

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: err.message,
    });
  }
};

exports.turnOffAllRelays = async (req, res) => {
  try {
    const cmd_id = publishCommand({
      command: "all_relays_off",
    });

    return res.status(202).json({
      success: true,
      data: {
        deviceId: req.params.deviceId,
        cmd_id,
        status: "pending",
      },
    });

  } catch (err) {
    console.error("[DeviceController] turnOffAllRelays:", err);

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: err.message,
    });
  }
};

exports.unlockAllRelays = async (req, res) => {
  try {
    const cmd_id = publishCommand({
      command: "unlock_all_relays",
    });

    return res.status(202).json({
      success: true,
      data: {
        deviceId: req.params.deviceId,
        cmd_id,
        status: "pending",
      },
    });

  } catch (err) {
    console.error("[DeviceController] unlockAllRelays:", err);

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: err.message,
    });
  }
};

exports.systemReboot = async (req, res) => {
  try {
    const cmd_id = publishCommand({
      command: "system_reboot",
    });

    return res.status(202).json({
      success: true,
      data: {
        deviceId: req.params.deviceId,
        cmd_id,
        status: "pending",
      },
    });

  } catch (err) {
    console.error("[DeviceController] systemReboot:", err);

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: err.message,
    });
  }
};

exports.controlAC = async (req, res) => {
  try {
    const { power, temp, tempStep, fan } = req.body;

    const fields = [
      power !== undefined,
      temp !== undefined,
      tempStep !== undefined,
      fan !== undefined,
    ];

    if (fields.filter(Boolean).length !== 1) {
      return res.status(400).json({
        success: false,
        error: "INVALID_AC_REQUEST",
        message:
          "Exactly one of power, temp, tempStep or fan must be provided.",
      });
    }

    const payload = {
      command: "ac_set",
    };

    if (power !== undefined) {
      if (typeof power !== "boolean") {
        return res.status(400).json({
          success: false,
          error: "INVALID_POWER",
          message: "'power' must be boolean.",
        });
      }
      payload.power = power;
    }

    if (temp !== undefined) {
      if (!Number.isInteger(temp) || temp < 16 || temp > 30) {
        return res.status(400).json({
          success: false,
          error: "INVALID_TEMP",
          message: "'temp' must be an integer between 16 and 30.",
        });
      }
      payload.temp = temp;
    }

    if (tempStep !== undefined) {
      if (!["up", "down"].includes(tempStep)) {
        return res.status(400).json({
          success: false,
          error: "INVALID_TEMP_STEP",
          message: "'tempStep' must be 'up' or 'down'.",
        });
      }
      payload.temp_step = tempStep;
    }

    if (fan !== undefined) {
      const validFans = [
        "auto",
        "min",
        "low",
        "med",
        "high",
        "max",
      ];

      if (!validFans.includes(fan)) {
        return res.status(400).json({
          success: false,
          error: "INVALID_FAN",
          message:
            "'fan' must be one of auto, min, low, med, high or max.",
        });
      }

      payload.fan = fan;
    }

    const cmd_id = publishCommand(payload);

    return res.status(202).json({
      success: true,
      data: {
        deviceId: req.params.deviceId,
        cmd_id,
        status: "pending",
      },
    });

  } catch (err) {
    console.error("[DeviceController] controlAC:", err);

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: err.message,
    });
  }
};