const express = require("express");

const router = express.Router();

const { authenticate } = require("../middlewares/auth.middleware");

const { register, login, me } = require("../controllers/auth.controller");

const asyncHandler = require("../utils/asyncHandler");

router.post("/register", asyncHandler(register));

router.post("/login", asyncHandler(login));

router.get("/me", asyncHandler(authenticate), asyncHandler(me));

module.exports = router;
