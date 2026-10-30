const express = require("express");

const router = express.Router();

const { authenticate } = require("../middlewares/auth.middleware");

const { register, login, me } = require("../controllers/auth.controller");

const asyncHandler = require("../utils/asyncHandler");

const authRateLimit = require("../middlewares/authRateLimit")();

router.post("/register", authRateLimit, asyncHandler(register));

router.post("/login", authRateLimit, asyncHandler(login));

router.get("/me", asyncHandler(authenticate), asyncHandler(me));

module.exports = router;
