const { rateLimit } = require("express-rate-limit");

const createRateLimiter = ({ windowMs, limit, message }) => {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });
};

exports.appLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  message: "Too many requests, please try again later",
});

exports.authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: "Too many authentication attempts, please try again later",
});

exports.emailLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: "Too many email requests, please try again later",
});