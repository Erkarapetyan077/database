const AppError = require("../utils/AppError");

const validateId = (req, res, next, value, name) => {
  if (!/^[1-9]\d*$/.test(value) || Number(value) > 2147483647) {
    return next(new AppError(`${name} must be a positive integer`, 400));
  }
  next();
};

const validateBody = (req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    if (req.body === undefined) req.body = {};
    if (req.body === null || Array.isArray(req.body) || typeof req.body !== "object") {
      return next(new AppError("Request body must be a JSON object", 400));
    }
  }
  next();
};

module.exports = { validateBody, validateId };
