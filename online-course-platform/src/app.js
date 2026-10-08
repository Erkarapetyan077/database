const express = require("express");

const app = express();

app.use(express.json());

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const courseRoutes = require("./routes/course.routes");

const errorHandler = require("./middlewares/errorHandler");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);

app.use(errorHandler);

module.exports = app;
