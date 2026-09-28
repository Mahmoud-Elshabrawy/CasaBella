const Factory = require("./handlerFactory");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError")

const mongoose = require("mongoose")

exports.getAllUsers = Factory.getAll(User);
exports.getUser = Factory.getOne(User);

exports.createUser = Factory.createOne(User);
exports.updateUser = catchAsync(async (req, res, next) => {
  const allowedFields = ["name", "email", "role", "active"];
  let update = {};

  allowedFields.forEach((field) => {
    if (req.body[field]) {
      update[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError("USER_NOT_FOUND", 404);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    data: user,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name: req.body.name, email: req.body.email },
    { new: true, runValidators: true },
  );

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.saveFcmToken = catchAsync(async (req, res, next) => {
  const { token, platform } = req.body;

  if (typeof token !== "string" || !token.trim()) {
    return next(new AppError("FCM_TOKEN_REQUIRED", 400));
  }

  if (!platform || !["android", "ios"].includes(platform)) {
    return next(new AppError("INVALID_PLATFORM", 400));
  }

  const cleanToken = token.trim();

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // remove token from any other user
      await User.updateMany(
        {
          _id: { $ne: req.user._id },
          "fcmTokens.token": cleanToken,
        },
        {
          $pull: {
            fcmTokens: {
              token: cleanToken,
            },
          },
        },
        { session },
      );

      // if token already exists for current user, update it
      const result = await User.updateOne(
        {
          _id: req.user._id,
          "fcmTokens.token": cleanToken,
        },
        {
          $set: {
            "fcmTokens.$.platform": platform,
            "fcmTokens.$.updatedAt": new Date(),
          },
        },
        {
          session,
          runValidators: true,
        },
      );

      // token doesn't exist for current user
      if (result.matchedCount === 0) {
        await User.updateOne(
          {
            _id: req.user._id,
            "fcmTokens.token": { $ne: cleanToken },
          },
          {
            $push: {
              fcmTokens: {
                token: cleanToken,
                platform,
                updatedAt: new Date(),
              },
            },
          },
          {
            session,
            runValidators: true,
          },
        );
      }
    });
  } finally {
    await session.endSession();
  }

  res.status(200).json({
    success: true,
  });
});

exports.removeFcmToken = catchAsync(async (req, res, next) => {
  const { token } = req.body;
  if (!token) return next(new AppError("FCM_TOKEN_REQUIRED", 400));

  await User.findOneAndUpdate(
    { _id: req.user._id },
    { $pull: { fcmTokens: { token } } },
  );

  res.status(200).json({
    success: true,
  });
});
