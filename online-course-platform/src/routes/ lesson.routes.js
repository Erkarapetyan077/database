const express = require("express");

const router = express.Router();

const {
  getCourseLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
} = require("../controllers/lesson.controller");

const asyncHandler = require("../utils/asyncHandler");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const ROLES = require("../constants/roles");

router.get(
  "/:courseId/lessons",
  asyncHandler(authenticate),
  authorize(ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.STUDENT),
  asyncHandler(getCourseLessons)
);

router.get(
  "/:id",
  asyncHandler(authenticate),
  authorize(ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.STUDENT),
  asyncHandler(getLessonById)
);

router.put(
  "/:id",
  asyncHandler(authenticate),
  authorize(ROLES.ADMIN, ROLES.INSTRUCTOR),
  asyncHandler(updateLesson)
);

router.delete(
  "/:id",
  asyncHandler(authenticate),
  authorize(ROLES.ADMIN, ROLES.INSTRUCTOR),
  asyncHandler(deleteLesson)
);

module.exports = router;
