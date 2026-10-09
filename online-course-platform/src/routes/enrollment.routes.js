const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const {
  enrollInCourse,
  getMyEnrollments,
} = require("../controllers/enrollment.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const ROLES = require("../constants/roles");

const router = express.Router();

router.get(
  "/me",
  asyncHandler(authenticate),
  authorize(ROLES.STUDENT),
  asyncHandler(getMyEnrollments)
);

router.post(
  "/:courseId",
  asyncHandler(authenticate),
  authorize(ROLES.STUDENT),
  asyncHandler(enrollInCourse)
);

module.exports = router;
