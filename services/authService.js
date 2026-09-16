const User = require("../models/userModel");
const AppError = require("../utils/appError");
const {generateToken} = require('../utils/generateToken')

exports.register = async (body) => {
  const { firstName, lastName, email, password } = body;

  // check if user exists
  const existsUser = await User.findOne({ email: email });
  if (existsUser) {
    throw new AppError("User already exists", 409);
  }

  const user = await User.create({ firstName, lastName, email, password });
  const token = generateToken(user._id)

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

  const token = generateToken(user._id)

  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    token,
  };
};
