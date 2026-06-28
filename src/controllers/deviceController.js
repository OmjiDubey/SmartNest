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
      type: "relay_set",
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
      master_lock: relays.masterLock,
      digital_switch: relays.digitalSwitch,
      runtime_sec: relays.items.map((r) => r.runtime_sec),
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
      type: "relay_toggle",
      relay,
    });

    return res.status(202).json({
      success: true,
      data: {
        device_id: req.params.deviceId,
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
      type: "relay_lock",
      relay,
      locked,
    });

    return res.status(202).json({
      success: true,
      data: {
        device_id: req.params.deviceId,
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
      type: "master_lock",
      state,
    });

    return res.status(202).json({
      success: true,
      data: {
        device_id: req.params.deviceId,
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
      type: "slave_reboot",
      target,
    });

    return res.status(202).json({
      success: true,
      data: {
        device_id: req.params.deviceId,
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
      type: "pzem_energy_reset",
    });

    return res.status(202).json({
      success: true,
      data: {
        device_id: req.params.deviceId,
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