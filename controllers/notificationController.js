const Notification = require("../models/notificationsModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Get current user's notifications
exports.getMyNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({
    user: req.user._id,
  }).sort("-createdAt");

  res.status(200).json({
    success: true,
    results: notifications.length,
    data: notifications,
  });
});

// Get unread notifications count
exports.getUnreadCount = catchAsync(async (req, res, next) => {
  const count = await Notification.countDocuments({
    user: req.user._id,
    isRead: false,
  });

  res.status(200).json({
    success: true,
    data: count,
  });
});

// Mark one notification as read
exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user._id,
    },
    {
      isRead: true,
    },
    {
      new: true,
    },
  );

  if (!notification) {
    return next(new AppError("NOTIFICATION_NOT_FOUND", 404));
  }

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// Mark all notifications as read
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  await Notification.updateMany(
    {
      user: req.user._id,
      isRead: false,
    },
    {
      isRead: true,
    },
  );

  res.status(200).json({
    success: true,
    message: "NOTIFICATIONS_MARKED_AS_READ",
  });
});
