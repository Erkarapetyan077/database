const express = require("express");

const { validateId } = require("../middlewares/validateRequest");

const router = express.Router();
router.param("id", validateId);

const {
  getCourses,
  createCourse,
  getCourseById,
  getMyCourses,
  getCourseStudents,
  createLesson,
  updateCourse,
  deleteCourse,
} = require("../controllers/course.controller");

const asyncHandler = require("../utils/asyncHandler");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const ROLES = require("../constants/roles");

router.get("/", asyncHandler(getCourses));

router.post(
  "/",
  asyncHandler(authenticate),
  authorize(ROLES.ADMIN, ROLES.INSTRUCTOR),
  asyncHandler(createCourse)
);

router.get(
  "/my",
  asyncHandler(authenticate),
  authorize(ROLES.INSTRUCTOR),
  asyncHandler(getMyCourses)
);

router.get(
  "/:id/students",
  asyncHandler(authenticate),
  authorize(ROLES.ADMIN, ROLES.INSTRUCTOR),
  asyncHandler(getCourseStudents)
);

router.post(
  "/:id/lessons",
  asyncHandler(authenticate),
  authorize(ROLES.ADMIN, ROLES.INSTRUCTOR),
  asyncHandler(createLesson)
);

router.put(
  "/:id",
  asyncHandler(authenticate),
  authorize(ROLES.ADMIN, ROLES.INSTRUCTOR),
  asyncHandler(updateCourse)
);

router.delete(
  "/:id",
  asyncHandler(authenticate),
  authorize(ROLES.ADMIN, ROLES.INSTRUCTOR),
  asyncHandler(deleteCourse)
);

router.get("/:id", asyncHandler(getCourseById));

module.exports = router;
