const AppError = require("../utils/appError");

const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  // Operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming or unknown errors
  console.error("UNEXPECTED ERROR:", err);

  return res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  });
};

// JWT Errors
const handleJWTError = () => {
  return next(new AppError("Invalid token. Please log in again.", 401));
}

const handleTokenExpiredError = () => {
  return next(new AppError("Your token has expired. Please log in again.", 401));
}

const GlobalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

   if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    if(err.name === 'JsonWebTokenError') err = handleJWTError(err)
    if(err.name === 'TokenExpiredError') err = handleJWTExpires(err)
    sendErrorProd(err, req, res);
  } 

};

module.exports = GlobalError;