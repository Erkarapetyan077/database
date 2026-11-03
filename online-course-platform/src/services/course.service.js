const { sequelize } = require("../config/database");
const {
  COURSE_NOT_FOUND,
  FORBIDDEN_COURSE_ACCESS,
} = require("../constants/errors/course.errors");
const ROLES = require("../constants/roles");
const { Course, Lesson, User } = require("../models");
const AppError = require("../utils/AppError");

const getCourses = async ({ category, level }) => {
  const where = {
    isPublished: true,
  };
  if (category) {
    where.category = category;
  }
  if (level) {
    where.level = level;
  }
  const courses = await Course.findAll({
    where,
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
        separate: true,
        order: [["order", "ASC"]],
      },
    ],
  });

  return course;
};

const getMyCourses = async (id) => {
  const courses = await Course.findAll({
    where: {
      instructorId: id,
    },
  });
  return courses;
};

const getCourseStudents = async (courseId, currentUser) => {
  const course = await Course.findByPk(courseId, {
    include: [
      {
        model: User,
        as: "students",
        attributes: ["id", "fullName", "email"],
        through: {
          attributes: ["status", "progress"],
        },
      },
    ],
  });
  if (!course) {
    throw new AppError(COURSE_NOT_FOUND, 404);
  }
  if (
    currentUser.role !== ROLES.ADMIN &&
    course.instructorId != currentUser.id
  ) {
    throw new AppError(FORBIDDEN_COURSE_ACCESS, 403);
  }
  return course.students;
};

const createLesson = async (courseId, data, currentUser) => {
  const course = await Course.findByPk(courseId);

  if (!course) {
    throw new AppError(COURSE_NOT_FOUND, 404);
  }

  if (
    currentUser.role !== ROLES.ADMIN &&
    course.instructorId != currentUser.id
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
  const course = await Course.findByPk(id);

  if (!course) {
    throw new AppError(COURSE_NOT_FOUND, 404);
  }

  if (
    currentUser.role !== ROLES.ADMIN &&
    course.instructorId != currentUser.id
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
    course.instructorId != currentUser.id
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
