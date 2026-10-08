const User = require("./user.model");
const Course = require("./course.model");
const Lesson = require("./lesson.model");
const Enrollment = require("./enrollment.model");

User.hasMany(Course, {
  as: "courses",
  foreignKey: "instructorId",
});

Course.belongsTo(User, {
  as: "instructor",
  foreignKey: "instructorId",
});

Course.hasMany(Lesson, {
  as: "lessons",
  foreignKey: "courseId",
  onDelete: "CASCADE",
});

Lesson.belongsTo(Course, {
  as: "course",
  foreignKey: "courseId",
});

User.belongsToMany(Course, {
  through: Enrollment,
  as: "enrolledCourses",
  foreignKey: "userId",
});

Course.belongsToMany(User, {
  through: Enrollment,
  as: "students",
  foreignKey: "courseId",
});

Enrollment.belongsTo(User, {
  foreignKey: "userId",
});

Enrollment.belongsTo(Course, {
  foreignKey: "courseId",
});

module.exports = {
  User,
  Course,
  Lesson,
  Enrollment,
};
