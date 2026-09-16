const authService = require("../services/authService");

exports.register = async (req, res, next) => {
  const user = await authService.register(req.body);
  return res.status(201).json({
    success: true,
    data: {...user},
  });
};


exports.login = async (req, res, next) => {
  const user = await authService.login(req.body);
  return res.status(200).json({
    success: true,
    data: {...user},
  });
};
