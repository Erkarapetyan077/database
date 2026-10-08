const express = require("express");

const router = express.Router();

const {
  getCourses,
  createCourse,
  getCourseById,
} = require("../controllers/course.controller");

const asyncHandler = require("../utils/asyncHandler");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.get("/", asyncHandler(getCourses));

router.post(
  "/",
  asyncHandler(authenticate),
  authorize("instructor", "admin"),
  asyncHandler(createCourse)
);

router.get("/:id", asyncHandler(getCourseById));

module.exports = router;
