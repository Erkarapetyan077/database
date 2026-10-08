const userService = require("../services/user.service");

const getUsers = async (req, res) => {
  const role = req.query.role;

  const users = await userService.getUsers(role);

  res.json({
    success: true,
    data: users,
  });
};

const getUserById = async (req, res) => {
  const id = req.params.id;

  const user = await userService.getUsersById(id);

  res.json({
    success: true,
    data: user,
  });
};

const updateUserRole = async (req, res) => {
  const id = req.params.id;
  const role = req.body.role;

  const user = await userService.updateUserRole(id, role);

  res.json({
    success: true,
    data: user,
  });
};

const deleteUser = async (req, res) => {
  const id = req.params.id;
  const currentUserId = req.user.id;

  await userService.deleteUser(id, currentUserId);

  res.json({
    success: true,
    message: "User deleted successfully",
  });
};

module.exports = {
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
};
