const lessonService = require("../services/lesson.service");

const getCourseLessons = async (req, res) => {
  const courseId = req.params.courseId;

  const currentUser = req.user;

  const lessons = await lessonService.getCourseLessons(courseId, currentUser);

  res.json({
    success: true,
    data: lessons,
  });
};

const getLessonById = async (req, res) => {
  const lessonId = req.params.id;
  const currentUser = req.user;

  const lesson = await lessonService.getLessonById(lessonId, currentUser);

  res.json({
    success: true,
    data: lesson,
  });
};

const updateLesson = async (req, res) => {
  const lessonId = req.params.id;
  const data = req.body;
  const currentUser = req.user;

  const lesson = await lessonService.updateLesson(lessonId, data, currentUser);

  res.json({
    success: true,
    data: lesson,
  });
};

const deleteLesson = async (req, res) => {
  const lessonId = req.params.id;
  const currentUser = req.user;

  const lesson = await lessonService.deleteLesson(lessonId, currentUser);

  res.json({
    success: true,
    message: "Lesson deleted successfully",
    data: lesson,
  });
};

module.exports = {
  getCourseLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
};
