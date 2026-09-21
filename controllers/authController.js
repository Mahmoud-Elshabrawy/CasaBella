const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/appError");

const {
  generateToken,
  generateRefreshToken,
} = require("../utils/generateToken");

const { sendEmail } = require("../services/emailService");

const { generatePasswordResetEmail } = require("../utils/emailTemplates");

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const formatUser = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  active: user.active,
});

const issueTokens = async (user) => {
  const token = generateToken(user._id);

  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = hashToken(refreshToken);

  await user.save({
    validateBeforeSave: false,
  });

  return {
    token,
    refreshToken,
  };
};

exports.register = catchAsync(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const existsUser = await User.findOne({
    email,
  });

  if (existsUser) {
    if (!existsUser.active) {
      throw new AppError(
        "Account is not verified. Please verify your email or resend the verification code",
        409,
      );
    }

    throw new AppError("User already exists", 409);
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    active: false,
  });

  const otp = user.createEmailVerificationOtp();

  await user.save({
    validateBeforeSave: false,
  });

  try {
    const html = generatePasswordResetEmail(
      otp,
      `${user.firstName} ${user.lastName}`,
    );

    await sendEmail({
      to: user.email,
      subject: "CasaBella Email Verification OTP",
      text: `Your email verification code is ${otp}. This code will expire in 10 minutes.`,
      html,
    });
  } catch (err) {
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpires = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    throw new AppError(
      "There was an error sending the email. Try again later!",
      500,
    );
  }

  res.status(201).json({
    success: true,
    data: {
      ...formatUser(user),
    },
  });
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.active) {
    throw new AppError("Your account is not active.", 403);
  }

  const tokens = await issueTokens(user);

  res.status(200).json({
    success: true,
    data: {
      ...formatUser(user),
      ...tokens,
    },
  });
});

exports.logout = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.refreshToken = undefined;

  await user.save({
    validateBeforeSave: false,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

exports.changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    throw new AppError("Please provide all the required fields", 400);
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError("Current password is incorrect", 401);
  }

  if (newPassword !== confirmNewPassword) {
    throw new AppError(
      "New password and confirm new password do not match",
      400,
    );
  }

  if (await user.comparePassword(newPassword)) {
    throw new AppError("New password is same as current password", 400);
  }

  user.password = newPassword;

  await user.save();

  const tokens = await issueTokens(user);

  res.status(200).json({
    success: true,
    data: {
      ...formatUser(user),
      ...tokens,
    },
  });
});

exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Please provide your email", 400);
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const otp = user.createPasswordResetOTP();

  await user.save({
    validateBeforeSave: false,
  });

  try {
    const html = generatePasswordResetEmail(
      otp,
      `${user.firstName} ${user.lastName}`,
    );

    await sendEmail({
      to: user.email,
      subject: "CasaBella Password Reset OTP",
      text: `Your password reset code is ${otp}. This code will expire in 10 minutes.`,
      html,
    });
  } catch (err) {
    user.passwordResetOTP = undefined;
    user.passwordResetExpires = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    throw new AppError(
      "There was an error sending the email. Try again later!",
      500,
    );
  }

  res.status(200).json({
    success: true,
    message: "Password reset OTP sent successfully",
  });
});

exports.verifyResetPasswordOTP = catchAsync(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError("Please provide email and OTP", 400);
  }

  const user = await User.findOne({
    email,
  }).select("+passwordResetOTP +passwordResetExpires");

  if (!user) {
    throw new AppError("user not found", 404);
  }

  if (!user.verifyResetPassword(otp)) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  user.passwordResetVerified = true;

  await user.save({
    validateBeforeSave: false,
  });

  res.status(200).json({
    success: true,
    message: "OTP verified successfully",
  });
});

exports.resetPassword = catchAsync(async (req, res) => {
  const { email, newPassword, confirmNewPassword } = req.body;

  if (!email || !newPassword || !confirmNewPassword) {
    throw new AppError("Please provide all required fields", 400);
  }

  if (newPassword !== confirmNewPassword) {
    throw new AppError(
      "New password and confirm new password do not match",
      400,
    );
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.passwordResetVerified) {
    throw new AppError("Please verify OTP first", 400);
  }

  user.password = newPassword;

  user.passwordResetOTP = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = false;

  await user.save();

  const tokens = await issueTokens(user);

  res.status(200).json({
    success: true,
    data: {
      ...formatUser(user),
      ...tokens,
    },
  });
});

exports.refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError("Please provide refresh token", 400);
  }

  const decodedToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  const userId = decodedToken.id;

  const user = await User.findById(userId).select("+refreshToken");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (hashToken(refreshToken) !== user.refreshToken) {
    throw new AppError("Invalid refresh token", 401);
  }

  const tokens = await issueTokens(user);

  res.status(200).json({
    success: true,
    data: {
      ...formatUser(user),
      ...tokens,
    },
  });
});

exports.createRefreshToken = exports.refreshToken;

exports.verifyEmail = catchAsync(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError("Please provide all the required fields", 400);
  }

  const user = await User.findOne({
    email,
  }).select("+emailVerificationOTP +emailVerificationExpires");

  if (!user) {
    throw new AppError("There is no user with this email", 404);
  }

  if (!user.verifyEmailVerification(otp)) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  user.active = true;

  user.emailVerificationOTP = undefined;

  user.emailVerificationExpires = undefined;

  const tokens = await issueTokens(user);

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    data: {
      ...formatUser(user),
      ...tokens,
    },
  });
});

exports.resendVerifyEmail = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Please provide your email", 400);
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.active) {
    throw new AppError("Your email is already verified", 400);
  }

  const otp = user.createEmailVerificationOtp();

  await user.save({
    validateBeforeSave: false,
  });

  try {
    const html = generatePasswordResetEmail(otp, user.firstName);

    await sendEmail({
      to: user.email,
      subject: "Verify Your Email",
      text: `Your email verification code is ${otp}. This code will expire in 10 minutes.`,
      html,
    });
  } catch (err) {
    user.emailVerificationOTP = undefined;

    user.emailVerificationExpires = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    throw new AppError(
      "There was an error sending the email. Try again later!",
      500,
    );
  }

  res.status(200).json({
    success: true,
    message: "Verification OTP sent successfully",
  });
});
