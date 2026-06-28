const express = require("express");

const authController = require("../controllers/authController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const deviceController = require("../controllers/deviceController.js");

const router = express.Router();

// Public
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);

// Protected
router.post("/logout", authMiddleware, authController.logout);
// router.get("/me", authMiddleware, authController.me);

module.exports = router;