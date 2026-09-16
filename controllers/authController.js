const authService = require("../services/authService");

exports.register = async (req, res, next) => {
  const user = await authService.register(req.body);
  return res.status(201).json({
    success: true,
      user,
  });
};

