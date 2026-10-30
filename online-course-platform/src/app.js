const express = require("express");

const app = express();

app.use(express.json());
app.use(require("./middlewares/validateRequest").validateBody);

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const courseRoutes = require("./routes/course.routes");
const lessonRoutes = require("./routes/lesson.routes");
const enrollmentRoutes = require("./routes/enrollment.routes");

const errorHandler = require("./middlewares/errorHandler");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/enrollments", enrollmentRoutes);

app.use(errorHandler);

module.exports = app;
