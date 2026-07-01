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

//=============== NEW APIs ====================
router.post(
  "/:deviceId/lights",
  authMiddleware,
  deviceMiddleware.validateDeviceId,
  deviceController.setLights
);

router.post(
  "/:deviceId/relays/off",
  authMiddleware,
  deviceMiddleware.validateDeviceId,
  deviceController.turnOffAllRelays
);

router.post(
  "/:deviceId/relays/unlock",
  authMiddleware,
  deviceMiddleware.validateDeviceId,
  deviceController.unlockAllRelays
);

router.post(
  "/:deviceId/system/reboot",
  authMiddleware,
  deviceMiddleware.validateDeviceId,
  deviceController.systemReboot
);

router.post(
  "/:deviceId/ac",
  authMiddleware,
  deviceMiddleware.validateDeviceId,
  deviceController.controlAC
);

module.exports = router;