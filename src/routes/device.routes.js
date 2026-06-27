const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const deviceController = require("../controllers/deviceController");

router.post(
  "/:deviceId/relays/:relayNo",
  authMiddleware,
  deviceController.setRelayState
);

module.exports = router;