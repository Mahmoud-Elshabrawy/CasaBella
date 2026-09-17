const User = require("../models/userModel");
const AppError = require("../utils/appError");
const { generateToken } = require("../utils/generateToken");
const { sendEmail } = require("../services/emailService");
const { generatePasswordResetEmail } = require("../utils/emailTemplates");

exports.register = async (body) => {
  const { firstName, lastName, email, password } = body;

  // check if user exists
  const existsUser = await User.findOne({ email: email });
  if (existsUser) {
    throw new AppError("User already exists", 409);
  }

  const user = await User.create({ firstName, lastName, email, password });
  const token = generateToken(user._id);

  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    token,
  };
};

exports.login = async (body) => {
  const { email, password } = body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken(user._id);

  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    token,
  };
};

exports.changePassword = async (body, userId) => {
  const { currentPassword, newPassword, confirmNewPassword } = body;
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    throw new AppError("please provide all the required fields", 400);
  }

  // check if user exists
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // check current password
  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError("current password is incorrect", 401);
  }

  // check if new pass match confirm new pass
  if (newPassword !== confirmNewPassword) {
    throw new AppError(
      "new password and confirm new password do not match",
      400,
    );
  }
  //check if new pass is same as current pass
  if (await user.comparePassword(newPassword)) {
    throw new AppError("new password is same as current password", 400);
  }

  // change password
  user.password = newPassword;
  await user.save();

  // generate new token
  const token = generateToken(user._id);

  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    token,
  };
};

exports.forgetPassword = async (email) => {
  if (!email) {
    throw new AppError("Please provide your email", 400);
  }

  // check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // generate otp
  const otp = user.createPasswordResetOTP();
  await user.save({ validateBeforeSave: false });

  try {
    const html = generatePasswordResetEmail(otp, `${user.firstName} ${user.lastName}`);

    // send email
    await sendEmail({
      to: user.email,
      subject: "CasaBella Password Reset OTP",
      text: `Your password reset code is ${otp}. This code will expire in 10 minutes.`,
      html,
    });
  } catch (err) {
    user.passwordResetOTP = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError(
      "There was an error sending the email. Try again later!",
      500,
    );
  }
};


exports.resetPassword = async (body) => {
  const { email, otp, newPassword, confirmNewPassword } = body;

  // 1) Check required fields
  if (!email || !otp || !newPassword || !confirmNewPassword) {
    throw new AppError("Please provide all required fields", 400);
  }

  // 2) Check passwords match
  if (newPassword !== confirmNewPassword) {
    throw new AppError(
      "New password and confirm new password do not match",
      400,
    );
  }

  // 3) Find user
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // 4) Verify OTP again before changing password
  if (!user.verifyResetPassword(otp)) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  // 5) Set new password
  user.password = newPassword;

  // 6) Remove OTP after successful reset
  user.passwordResetOTP = undefined;
  user.passwordResetExpires = undefined;

  // pre("save") will hash password
  // and update passwordChangedAt automatically
  await user.save();

  // 7) Generate new access token
  const token = generateToken(user._id);

  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    token,
  };
};
