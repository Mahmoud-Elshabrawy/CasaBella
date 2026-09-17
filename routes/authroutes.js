const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.patch("/change-password", protect, authController.changePassword);
router.post("/forget-password", authController.forgotPassword);
router.patch("/reset-password", authController.resetPassword);


module.exports = router;
