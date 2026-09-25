const Factory = require("./handlerFactory");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

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
