const User = require("../models/userModel");
const AppError = require("../utils/appError");

exports.register = async (body) => {
  const { firstName, lastName, email, password } = body;

  // check if user exists
  const existsUser = await User.findOne({ email: email });
  if (existsUser) {
    throw new AppError("User already exists", 409);
  }

  const user = await User.create({ firstName, lastName, email, password });

  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
