const { Course, Lesson } = require("../models");
const { User } = require("../models");

const getCourses = async () => {
  const courses = await Course.findAll({
    where: {
      isPublished: true,
    },
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
      { model: User, as: "instructor" },
      { model: Lesson, as: "lessons" },
    ],
  });

  return course;
};

module.exports = {
  getCourses,
  createCourse,
  getCourseById,
};
