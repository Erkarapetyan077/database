const express = require("express");

const { validateId } = require("../middlewares/validateRequest");

const router = express.Router();
router.param("id", validateId);

const { getUsers, getUserById } = require("../controllers/user.controller");

const { authenticate, authorize } = require("../middlewares/auth.middleware");

const asyncHandler = require("../utils/asyncHandler");
const { deleteUser } = require("../controllers/user.controller");
const { updateUserRole } = require("../controllers/user.controller");

router.get(
  "/",
  asyncHandler(authenticate),
  authorize("admin"),
  asyncHandler(getUsers)
);

router.get(
  "/:id",
  asyncHandler(authenticate),
  authorize("admin"),
  asyncHandler(getUserById)
);

router.patch(
  "/:id/role",
  asyncHandler(authenticate),
  authorize("admin"),
  asyncHandler(updateUserRole)
);

router.delete(
  "/:id",
  asyncHandler(authenticate),
  authorize("admin"),
  asyncHandler(deleteUser)
);

module.exports = router;
