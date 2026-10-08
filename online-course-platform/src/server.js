const { sequelize, ensureDatabaseExists } = require("./config/database");
const { PORT } = require("./config/env");
const { User, Course, Lesson, Enrollment } = require("./models");
const app = require("./app");

const startServer = async () => {
  try {
    await ensureDatabaseExists();

    await sequelize.authenticate();

    console.log("Database connected successfully");

    await sequelize.sync();

    console.log("Database tables synchronized");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);

    process.exit(1);
  }
};

startServer();
