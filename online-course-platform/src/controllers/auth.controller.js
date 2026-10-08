const authService = require("../services/auth.service");

const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  const user = await authService.register(fullName, email, password);

  res.json({
    message: "User registered successfully",
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  res.json({
    message: "Login successful",
    result: result.token,
    user: {
      id: result.user.id,
      fullName: result.user.fullName,
      email: result.user.email,
      role: result.user.role,
    },
  });
};

const me = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

module.exports = {
  register,
  login,
  me,
};
