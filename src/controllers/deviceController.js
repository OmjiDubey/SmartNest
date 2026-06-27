const { publishCommand } = require("../mqtt/client");

exports.setRelayState = async (req, res) => {
  try {
    const { deviceId, relayNo } = req.params;
    const { state } = req.body;

    const relay = Number(relayNo);

    // Validation
    if (!Number.isInteger(relay) || relay < 1 || relay > 7) {
      return res.status(400).json({
        success: false,
        message: "Relay number must be between 1 and 7.",
      });
    }

    if (typeof state !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "state must be a boolean.",
      });
    }

    const cmd_id = publishCommand({
      type: "relay_set",
      relay,
      state,
    });

    return res.status(202).json({
      success: true,
      message: "Command accepted.",
      deviceId,
      cmd_id,
      status: "pending",
    });
  } catch (error) {
    console.error("[DeviceController] setRelayState:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};