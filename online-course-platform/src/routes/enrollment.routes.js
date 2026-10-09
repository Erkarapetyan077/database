const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const {
  enrollInCourse,
  getMyEnrollments,
  updateEnrollmentProgress,
  cancelEnrollment,
  getAllEnrollments,
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

router.patch(
  "/:id/progress",
  asyncHandler(authenticate),
  authorize(ROLES.STUDENT),
  asyncHandler(updateEnrollmentProgress)
);

router.post(
  "/:courseId",
  asyncHandler(authenticate),
  authorize(ROLES.STUDENT),
  asyncHandler(enrollInCourse)
);

router.delete(
  "/:id",
  asyncHandler(authenticate),
  authorize(ROLES.STUDENT, ROLES.ADMIN),
  asyncHandler(cancelEnrollment)
);

router.get(
  "/",
  asyncHandler(authenticate),
  authorize(ROLES.ADMIN),
  asyncHandler(getAllEnrollments)
);

module.exports = router;
