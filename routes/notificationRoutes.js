const express = require("express")
const {protect} = require("../middlewares/authMiddleware")
const {getMyNotifications, getUnreadCount, markAsRead, markAllAsRead} = require("../controllers/notificationController");
const router = express.Router();

router.use(protect);
router.get("/", getMyNotifications);
router.get("/unread", getUnreadCount);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);

module.exports = router;