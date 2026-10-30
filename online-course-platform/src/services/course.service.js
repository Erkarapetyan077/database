const { sequelize } = require("../config/database");
const {
  COURSE_NOT_FOUND,
  FORBIDDEN_COURSE_ACCESS,
} = require("../constants/errors/course.errors");
const ROLES = require("../constants/roles");
const { Course, Lesson, User } = require("../models");
const AppError = require("../utils/AppError");

const validation = require("../utils/validation");

const getCourses = async ({ category, level, ...pagination }) => {
  const where = {
    isPublished: true,
  };
  if (category !== undefined) {
    validation.text(category, "category");
    where.category = category;
  }
  if (level !== undefined) {
    validation.choice(level, "level", ["beginner", "intermediate", "advanced"]);
    where.level = level;
  }
  const courses = await Course.findAll({
    where,
    ...pagination,
    subQuery: false,
    order: [["id", "ASC"]],
    include: [
      {
        model: User,
        as: "instructor",
        attributes: ["id", "fullName", "email"],
      },
      {
        model: Lesson,
        as: "lessons",
        attributes: [],
      },
    ],
    attributes: {
      include: [
        [sequelize.fn("COUNT", sequelize.col("lessons.id")), "lessonCount"],
      ],
    },
    group: ["Course.id", "instructor.id"],
  });

  return courses;
};

const createCourse = async (data, instructorId) => {
  validation.course(data);
  const course = await Course.create({
    title: data.title,
    description: data.description,
    category: data.category,
    level: data.level,
    price: data.price,
    isPublished: data.isPublished,
    instructorId: instructorId,
  });

  return course;
};

const getCourseById = async (id) => {
  const course = await Course.findByPk(id, {
    include: [
      {
        model: User,
        as: "instructor",
        attributes: ["id", "fullName", "email"],
      },
      {
        model: Lesson,
        as: "lessons",
        attributes: ["id", "title", "duration", "order", "courseId"],
        separate: true,
        order: [["order", "ASC"]],
      },
    ],
  });

  if (!course || !course.isPublished) throw new AppError(COURSE_NOT_FOUND, 404);
  return course;
};

const getMyCourses = async (id, pagination) => {
  const courses = await Course.findAll({
    where: {
      instructorId: id,
    },
    ...pagination,
    order: [["id", "ASC"]],
  });
  return courses;
};

const getCourseStudents = async (courseId, currentUser, pagination) => {
  const course = await Course.findByPk(courseId);
  if (!course) throw new AppError(COURSE_NOT_FOUND, 404);
  if (currentUser.role !== ROLES.ADMIN && course.instructorId !== currentUser.id) {
    throw new AppError(FORBIDDEN_COURSE_ACCESS, 403);
  }
  return course.getStudents({
    attributes: ["id", "fullName", "email"],
    joinTableAttributes: ["status", "progress"],
    ...pagination,
    order: [["id", "ASC"]],
  });
};

const createLesson = async (courseId, data, currentUser) => {
  validation.lesson(data);
  const course = await Course.findByPk(courseId);

  if (!course) {
    throw new AppError(COURSE_NOT_FOUND, 404);
  }

  if (
    currentUser.role !== ROLES.ADMIN &&
    course.instructorId !== currentUser.id
  ) {
    throw new AppError(FORBIDDEN_COURSE_ACCESS, 403);
  }

  const lesson = await Lesson.create({
    title: data.title,
    content: data.content,
    videoUrl: data.videoUrl,
    duration: data.duration,
    order: data.order,
    courseId: courseId,
  });

  return lesson;
};

const updateCourse = async (id, data, currentUser) => {
  validation.course(data, true);
  const course = await Course.findByPk(id);

  if (!course) {
    throw new AppError(COURSE_NOT_FOUND, 404);
  }

  if (
    currentUser.role !== ROLES.ADMIN &&
    course.instructorId !== currentUser.id
  ) {
    throw new AppError(FORBIDDEN_COURSE_ACCESS, 403);
  }

  await course.update({
    title: data.title,
    description: data.description,
    category: data.category,
    level: data.level,
    price: data.price,
    isPublished: data.isPublished,
  });

  return course;
};

const deleteCourse = async (id, currentUser) => {
  const course = await Course.findByPk(id);

  if (!course) {
    throw new AppError(COURSE_NOT_FOUND, 404);
  }
  if (
    currentUser.role !== ROLES.ADMIN &&
    course.instructorId !== currentUser.id
  ) {
    throw new AppError(FORBIDDEN_COURSE_ACCESS, 403);
  }

  await course.destroy();

  return {
    message: "Course deleted successfully",
  };
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
