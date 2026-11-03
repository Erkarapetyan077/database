const { COURSE_NOT_FOUND } = require("../constants/errors/course.errors");
const {
  LESSON_NOT_FOUND,
  FORBIDDEN_LESSON_ACCESS,
} = require("../constants/errors/lesson.errors");
const ROLES = require("../constants/roles");
const { Course, Lesson, Enrollment } = require("../models");
const AppError = require("../utils/AppError");

const getCourseLessons = async (courseId, currentUser) => {
  const course = await Course.findByPk(courseId);

  if (!course) {
    throw new AppError(LESSON_NOT_FOUND, 404);
  }

  const enrollment = await Enrollment.findOne({
    where: {
      userId: currentUser.id,
      courseId: courseId,
      status: ["active", "completed"],
    },
  });
  const isAdmin = currentUser.role === ROLES.ADMIN;

  const isInstructor = Number(course.instructorId) === Number(currentUser.id);

  const isEnrolledStudent =
    currentUser.role === ROLES.STUDENT && Boolean(enrollment);

  if (!isAdmin && !isInstructor && !isEnrolledStudent) {
    throw new AppError(FORBIDDEN_LESSON_ACCESS, 403);
  }

  const lessons = await Lesson.findAll({
    where: {
      courseId: courseId,
    },
    order: [["order", "ASC"]],
  });

  return lessons;
};

const getLessonById = async (lessonId, currentUser) => {
  const lesson = await Lesson.findByPk(lessonId);

  if (!lesson) {
    throw new AppError(LESSON_NOT_FOUND, 404);
  }
  const course = await Course.findByPk(lesson.courseId);

  if (!course) {
    throw new AppError(COURSE_NOT_FOUND, 404);
  }

  const enrollment = await Enrollment.findOne({
    where: {
      userId: currentUser.id,
      courseId: lesson.courseId,
      status: ["active", "completed"],
    },
  });

  const isAdmin = currentUser.role === ROLES.ADMIN;

  const isInstructor = Number(course.instructorId) === Number(currentUser.id);

  const isEnrolledStudent =
    currentUser.role === ROLES.STUDENT && Boolean(enrollment);

  if (!isAdmin && !isInstructor && !isEnrolledStudent) {
    throw new AppError(FORBIDDEN_LESSON_ACCESS, 403);
  }
  return lesson;
};

const updateLesson = async (lessonId, data, currentUser) => {
  const lesson = await Lesson.findByPk(lessonId);

  if (!lesson) {
    throw new AppError(LESSON_NOT_FOUND, 404);
  }

  const course = await Course.findByPk(lesson.courseId);

  if (!course) {
    throw new AppError(COURSE_NOT_FOUND, 404);
  }

  const isAdmin = currentUser.role === ROLES.ADMIN;

  const isInstructor = Number(course.instructorId) === Number(currentUser.id);

  if (!isAdmin && !isInstructor) {
    throw new AppError(FORBIDDEN_LESSON_ACCESS, 403);
  }

  const { title, content, videoUrl, duration, order } = data;

  await lesson.update({
    title,
    content,
    videoUrl,
    duration,
    order,
  });

  return lesson;
};

const deleteLesson = async (lessonId, currentUser) => {
  const lesson = await Lesson.findByPk(lessonId);

  if (!lesson) {
    throw new AppError(LESSON_NOT_FOUND, 404);
  }

  const course = await Course.findByPk(lesson.courseId);

  if (!course) {
    throw new AppError(COURSE_NOT_FOUND, 404);
  }

  const isAdmin = currentUser.role === ROLES.ADMIN;

  const isInstructor = Number(course.instructorId) === Number(currentUser.id);

  if (!isAdmin && !isInstructor) {
    throw new AppError(FORBIDDEN_LESSON_ACCESS, 403);
  }

  await lesson.destroy();

  return lesson;
};


module.exports = {
  getCourseLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
};
