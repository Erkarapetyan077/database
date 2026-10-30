const { pagination } = require("../utils/validation");
const courseService = require("../services/course.service");

const getCourses = async (req, res) => {
  const { category, level } = req.query;
  const courses = await courseService.getCourses({ category, level, ...pagination(req.query) });

  res.json({
    success: true,
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

const getMyCourses = async (req, res) => {
  const id = req.user.id;

  const courses = await courseService.getMyCourses(id, pagination(req.query));

  res.json({
    success: true,
    data: courses,
  });
};

const getCourseStudents = async (req, res) => {
  const currentUser = req.user;
  const courseId = req.params.id;

  const students = await courseService.getCourseStudents(
    courseId,
    currentUser,
    pagination(req.query)
  );

  res.json({
    success: true,
    data: students,
  });
};

const createLesson = async (req, res) => {
  const id = req.params.id;

  const currentUser = req.user;

  const data = req.body;

  const lesson = await courseService.createLesson(id, data, currentUser);

  res.json({
    success: true,
    data: lesson,
  });
};

const updateCourse = async (req, res) => {
  const id = req.params.id;
  const currentUser = req.user;
  const data = req.body;

  const updatedCourse = await courseService.updateCourse(id, data, currentUser);

  res.json({
    success: true,
    data: updatedCourse,
  });
};

const deleteCourse = async (req, res) => {
  const id = req.params.id;

  const currentUser = req.user;

  const result = await courseService.deleteCourse(id, currentUser);

  res.json({
    success: true,
    data: result,
  });
};

module.exports = {
  getCourses,
  createCourse,
  getCourseById,
  getMyCourses,
  getCourseStudents,
  createLesson,
  updateCourse,
  deleteCourse,
};
