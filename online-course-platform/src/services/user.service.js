const { User } = require("../models");

const AppError = require("../utils/AppError");

const USER_ERRORS = require("../constants/errors/user.errors");

const getUsers = async (role) => {
  const where = {};

  if (role) {
    where.role = role;
  }

  const users = await User.findAll({
    where: where,
    attributes: {
      exclude: ["password"],
    },
  });

  return users;
};

const getUsersById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: {
      exclude: ["password"],
    },
  });

  if (!user) {
    throw new AppError(USER_ERRORS.USER_NOT_FOUND, 404);
  }

  return user;
};

const updateUserRole = async (id, role) => {
  const user = await User.findByPk(id);

  if (!user) {
    throw new AppError(USER_ERRORS.USER_NOT_FOUND, 404);
  }

  user.role = role;

  await user.save();

  return user;
};

const deleteUser = async (id, currentUserId) => {
  if (Number(id) === currentUserId) {
    throw new AppError(USER_ERRORS.CANNOT_DELETE_SELF, 400);
  }

  const user = await User.findByPk(id);

  if (!user) {
    throw new AppError(USER_ERRORS.USER_NOT_FOUND, 404);
  }

  await user.destroy();
};

module.exports = {
  getUsers,
  getUsersById,
  updateUserRole,
  deleteUser,
};
