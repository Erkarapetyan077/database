const validation = require("../utils/validation");
const { User } = require("../models");

const AppError = require("../utils/AppError");

const USER_ERRORS = require("../constants/errors/user.errors");

const getUsers = async (role, pagination) => {
  if (role !== undefined) validation.role(role);
  const where = {};

  if (role) {
    where.role = role;
  }

  const users = await User.findAll({
    where: where,
    ...pagination,
    order: [["id", "ASC"]],
    attributes: {
      exclude: ["password"],
    },
  });

  return users;
};

const getUserById = async (id) => {
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

const updateUserRole = async (id, role, currentUserId) => {
  validation.role(role);
  if (Number(id) === currentUserId) throw new AppError(USER_ERRORS.CANNOT_CHANGE_OWN_ROLE, 400);
  const user = await User.findByPk(id);

  if (!user) {
    throw new AppError(USER_ERRORS.USER_NOT_FOUND, 404);
  }

  user.role = role;

  await user.save();

  return getUserById(id);
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
  getUserById,
  updateUserRole,
  deleteUser,
};
