const AppError = require("../utils/appError");

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
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

//  handle mongo validation error
const handleValidationError = (err) => {
  const message = Object.values(err.errors)
    .map((error) => error.message)
    .join(",");

  return new AppError(message, 400);
};

// MongoDB duplicate field errors
const handleDuplicateFieldError = (err) => {
  const field = Object.keys(err.keyValue || {})[0];

  if (field === "email") {
    return new AppError("Email already exists", 409);
  }

  return new AppError("Duplicate value", 409);
};

// JWT Errors
const handleJWTError = () => {
  return new AppError("Invalid token. Please log in again.", 401);
};

const handleTokenExpiredError = () => {
  return new AppError("Your token has expired. Please log in again.", 401);
};

const handleInvalidJson = () => {
  return new AppError("Invalid JSON payload", 400);
};

const handlePayloadTooLarge = () => {
  return new AppError("Request body is too large", 413);
};

const GlobalError = (err, req, res, next) => {
  let error = err;

  // Convert known errors into operational errors
  if (err.name === "ValidationError") {
    error = handleValidationError(err);
  }

  if (err.code === 11000) {
    error = handleDuplicateFieldError(err);
  }

  if (err.name === "JsonWebTokenError") {
    error = handleJWTError();
  }

  if (err.name === "TokenExpiredError") {
    error = handleTokenExpiredError();
  }

  if (err.type === "entity.parse.failed") {
    error = handleInvalidJson();
  }

  if (err.type === "entity.too.large") {
    error = handlePayloadTooLarge();
  }

  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

module.exports = GlobalError;
