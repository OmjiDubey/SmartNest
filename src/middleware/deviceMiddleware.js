const config = require("../config/mqtt");

const validateDeviceId = (req, res, next) => {
  const { deviceId } = req.params;

  if (!deviceId) {
    return res.status(400).json({
      success: false,
      error: "DEVICE_ID_REQUIRED",
      message: "Device ID is required.",
    });
  }

  // MVP: Single device support
  if (deviceId !== config.deviceId) {
    return res.status(404).json({
      success: false,
      error: "DEVICE_NOT_FOUND",
      message: `Device '${deviceId}' not found.`,
    });
  }

  next();
};

module.exports = {
  validateDeviceId,
};