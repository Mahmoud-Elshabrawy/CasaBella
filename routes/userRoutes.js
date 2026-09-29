const express = require("express");

const { protect, restrictTo } = require("../middlewares/authMiddleware");

const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  getMe,
  updateMe,
  saveFcmToken,
  removeFcmToken,
} = require("../controllers/userController");

const router = express.Router();

// All routes below require authentication
router.use(protect);

// Normal user routes
router.route("/me").get(getMe).patch(updateMe);

router.post("/fcm-token", saveFcmToken);
router.delete("/fcm-token", removeFcmToken);

// Admin only routes
router.use(restrictTo("admin"));

router.route("/").get(getAllUsers).post(createUser);

router.route("/:id").get(getUser).patch(updateUser);

module.exports = router;