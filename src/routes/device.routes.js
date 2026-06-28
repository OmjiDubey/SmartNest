const express = require("express");
const deviceMiddleware = require("../middleware/deviceMiddleware");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const deviceController = require("../controllers/deviceController");

router.post(
    "/:deviceId/relays/:relayNo",
    authMiddleware,
    deviceMiddleware.validateDeviceId,
    deviceController.setRelayState
);

router.get(
    "/:deviceId/relays",
    authMiddleware,
    deviceMiddleware.validateDeviceId,
    deviceController.getRelays
);

router.post(
  "/:deviceId/relays/:relayNo/toggle",
  authMiddleware,
  deviceMiddleware.validateDeviceId,
  deviceController.toggleRelay
);

router.post(
  "/:deviceId/relays/:relayNo/lock",
  authMiddleware,
  deviceMiddleware.validateDeviceId,
  deviceController.setRelayLock
);

router.post(
  "/:deviceId/master-lock",
  authMiddleware,
  deviceMiddleware.validateDeviceId,
  deviceController.setMasterLock
);

router.post(
    "/:deviceId/slave-reboot",
    authMiddleware,
    deviceMiddleware.validateDeviceId,
    deviceController.rebootSlave
);

router.post(
  "/:deviceId/pzem/reset-energy",
  authMiddleware,
  deviceMiddleware.validateDeviceId,
  deviceController.resetPzemEnergy
);

module.exports = router;