const AppError = require("../utils/appError");

const hasUnsafeKeys = (value) => {
  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.entries(value).some(([key, nestedValue]) => {
    const unsafeKey =
      key.startsWith("$") ||
      key.includes(".") ||
      key === "__proto__" ||
      key === "prototype" ||
      key === "constructor";

    return unsafeKey || hasUnsafeKeys(nestedValue);
  });
};

exports.preventNoSqlInjection = (req, res, next) => {
  if (hasUnsafeKeys(req.body) || hasUnsafeKeys(req.query)) {
    return next(new AppError("Request contains invalid field names", 400));
  }

  next();
};

exports.preventParameterPollution = (req, res, next) => {
  const duplicateParameter = Object.entries(req.query).find(([, value]) =>
    Array.isArray(value),
  );

  if (duplicateParameter) {
    const [parameterName] = duplicateParameter;

    return next(
      new AppError(`Duplicate query parameter: ${parameterName}`, 400),
    );
  }

  next();
};
