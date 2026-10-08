const courseService = require("../services/course.service");

const getCourses = async (req, res) => {
  const courses = await courseService.getCourses();

  res.json({
    succes: true,
    data: courses,
  });
};

const createCourse = async (req, res) => {
  const course = await courseService.createCourse(req.body, req.user.id);

  res.status(201).json({
    success: true,
    data: course,
  });
};

const getCourseById = async (req, res) => {
  const id = req.params.id;

  const course = await courseService.getCourseById(id);

  res.json({
    success: true,
    data: course,
  });
};

module.exports = {
  getCourses,
  createCourse,
  getCourseById,
};
