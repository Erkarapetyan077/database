const { Enrollment, Course, User } = require("../models");

const AppError = require("../utils/AppError");
const ROLES = require("../constants/roles");

const {
  ALREADY_ENROLLED,
  COURSE_NOT_PUBLISHED,
  COURSE_NOT_FOUND,
  ONLY_STUDENTS_CAN_ENROLL,
  INVALID_PROGRESS,
  ENROLLMENT_NOT_FOUND,
  FORBIDDEN_ENROLLMENT_ACCESS,
  CANCELLED_ENROLLMENT_CANNOT_BE_UPDATED,
  FORBIDDEN_COURSE_ACCESS,
} = require("../constants/errors/enrollment.errors");

const enrollInCourse = async (courseId, currentUser) => {
  if (currentUser.role !== ROLES.STUDENT) {
    throw new AppError(ONLY_STUDENTS_CAN_ENROLL, 403);
  }

  const course = await Course.findByPk(courseId);

  if (!course) {
    throw new AppError(COURSE_NOT_FOUND, 404);
  }
  if (course.instructorId === currentUser.id) {
    throw new AppError(FORBIDDEN_COURSE_ACCESS, 403);
  }

  if (!course.isPublished) {
    throw new AppError(COURSE_NOT_PUBLISHED, 400);
  }

  const existingEnrollment = await Enrollment.findOne({
    where: {
      userId: currentUser.id,
      courseId: courseId,
    },
  });

  if (existingEnrollment) {
    throw new AppError(ALREADY_ENROLLED, 409);
  }

  const enrollment = await Enrollment.create({
    userId: currentUser.id,
    courseId: courseId,
    status: "active",
    progress: 0,
  });

  return enrollment;
};

const getMyEnrollments = async (currentUser) => {
  if (currentUser.role !== ROLES.STUDENT) {
    throw new AppError(ONLY_STUDENTS_CAN_ENROLL, 403);
  }

  const enrollments = await Enrollment.findAll({
    where: {
      userId: currentUser.id,
    },
    include: [
      {
        model: Course,
        include: [
          {
            model: User,
            as: "instructor",
            attributes: ["id", "fullName", "email"],
          },
        ],
      },
    ],
  });

  return enrollments;
};

const updateEnrollmentProgress = async (
  enrollmentId,
  progress,
  currentUser
) => {
  if (currentUser.role !== ROLES.STUDENT) {
    throw new AppError(ONLY_STUDENTS_CAN_ENROLL, 403);
  }

  if (typeof progress !== "number" || progress < 0 || progress > 100) {
    throw new AppError(INVALID_PROGRESS, 400);
  }

  const enrollment = await Enrollment.findByPk(enrollmentId);

  if (!enrollment) {
    throw new AppError(ENROLLMENT_NOT_FOUND, 404);
  }

  if (enrollment.userId !== currentUser.id) {
    throw new AppError(FORBIDDEN_ENROLLMENT_ACCESS, 403);
  }

  if (enrollment.status === "cancelled") {
    throw new AppError(CANCELLED_ENROLLMENT_CANNOT_BE_UPDATED, 400);
  }

  enrollment.progress = progress;

  if (progress === 100) {
    enrollment.status = "completed";
  }

  await enrollment.save();

  return enrollment;
};

const cancelEnrollment = async (enrollmentId, currentUser) => {
  const enrollment = await Enrollment.findByPk(enrollmentId);

  if (!enrollment) {
    throw new AppError(ENROLLMENT_NOT_FOUND, 404);
  }

  if (
    currentUser.role !== ROLES.ADMIN &&
    enrollment.userId !== currentUser.id
  ) {
    throw new AppError(FORBIDDEN_ENROLLMENT_ACCESS, 403);
  }

  enrollment.status = "cancelled";

  await enrollment.save();

  return enrollment;
};

const getAllEnrollments = async () => {
  const enrollments = await Enrollment.findAll({
    include: [
      {
        model: User,
        attributes: ["id", "fullName", "email", "role"],
      },
      {
        model: Course,
      },
    ],
  });

  return enrollments;
};

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  updateEnrollmentProgress,
  cancelEnrollment,
  getAllEnrollments,
};
