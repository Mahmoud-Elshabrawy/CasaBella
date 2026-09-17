const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");

exports.protect = async (req, res, next) => {
  let token;

  // get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError(
        "you are not logged in, please login to access this route",
        401,
      ),
    );
  }

  // verify token
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  // check if current user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError("the user belonging to this token does not exist", 401),
    );
  }

  // Check if user changed password after token was issued
  if(currentUser.changedPasswordAfter(decoded.iat)){
    return next(
      new AppError("user recently changed password, please login again", 401),
    )
  }

  req.user = currentUser;
  next();
};


exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("you do not have permission to perform this action", 403))
        }
        next()
    }
}