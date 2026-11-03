const bcrypt = require("bcryptjs");

const { generateToken } = require("../utils/jwt");

const AppError = require("../utils/AppError");

const AUTH_ERRORS = require("../constants/errors/auth.errors");

const { User } = require("../models");

const register = async (fullName, email, password) => {
  const existingUser = await User.findOne({
    where: {
      email: email,
    },
  });

  if (existingUser) {
    throw new AppError(AUTH_ERRORS.EMAIL_ALREADY_EXISTS, 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName: fullName,
    email: email,
    password: hashedPassword,
  });

  return user;
};

const login = async (email, password) => {
  const user = await User.findOne({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new AppError(AUTH_ERRORS.INVALID_CREDENTIALS, 401);
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new AppError(AUTH_ERRORS.INVALID_CREDENTIALS, 401);
  }

  const token = generateToken({
    id: user.id,
    role: user.role,
  });

  return {
    user: user,
    token: token,
  };
};


module.exports = {
  register,
  login,
};
