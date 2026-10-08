const { verifyToken } = require("../utils/jwt");

const { User } = require("../models");

const AppError = require("../utils/AppError");

const AUTH_ERRORS = require("../constants/errors/auth.errors");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(AUTH_ERRORS.AUTHENTICATION_REQUIRED, 401);
  }

  const token = authHeader.split(" ")[1];

  const decoded = verifyToken(token);

  const user = await User.findByPk(decoded.id);

  if (!user) {
    throw new AppError(AUTH_ERRORS.AUTHENTICATION_REQUIRED, 401);
  }

  req.user = user;

  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Access denied", 403));
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
