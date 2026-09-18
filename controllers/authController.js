const authService = require("../services/authService");

exports.register = async (req, res, next) => {
  const user = await authService.register(req.body);
  return res.status(201).json({
    success: true,
    data: { ...user },
  });
};

exports.login = async (req, res, next) => {
  const user = await authService.login(req.body);
  return res.status(200).json({
    success: true,
    data: { ...user },
  });
};

exports.logout = async (req, res, next) => {
  await authService.logout(req.user._id);
  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

exports.changePassword = async (req, res, next) => {
  const user = await authService.changePassword(req.body, req.user._id);
  return res.status(200).json({
    success: true,
    data: { ...user },
  });
};

exports.forgotPassword = async (req, res, next) => {
  await authService.forgotPassword(req.body.email);
  return res.status(200).json({
    success: true,
    message: "OTP sent successfully",
  });
};

exports.resetPassword = async (req, res, next) => {
  const user = await authService.resetPassword(req.body);
  return res.status(200).json({
    success: true,
    data: { ...user },
  });
};

exports.refreshToken = async (req, res, next) => {
  const user = await authService.createRefreshToken(req.body.refreshToken);
  return res.status(200).json({
    success: true,
    data: { ...user },
  });
};

exports.verifyEmail = async (req, res, next) => {
  const user = await authService.verifyEmail(req.body);
  return res.status(200).json({
    success: true,
    message: "Email verified successfully",
    data: { ...user },
  });
};

exports.resendVerifyEmail = async (req, res, next) => {
  await authService.resendVerifyEmail(req.body.email);
  return res.status(200).json({
    success: true,
    message: "OTP sent successfully",
  });
};
