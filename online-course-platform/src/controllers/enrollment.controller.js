const enrollmentService = require("../services/enrollment.service");

const enrollInCourse = async (req, res) => {
  const courseId = req.params.courseId;
  const currentUser = req.user;

  const enrollment = await enrollmentService.enrollInCourse(
    courseId,
    currentUser
  );

  res.status(201).json({
    success: true,
    data: enrollment,
  });
};

const getMyEnrollments = async (req, res) => {
  let currentUser = req.user;

  const myEnrollments = await enrollmentService.getMyEnrollments(currentUser);

  res.json({
    success: true,
    data: myEnrollments,
  });
};

const updateEnrollmentProgress = async (req, res) => {
  const enrollmentId = req.params.id;
  const progress = req.body.progress;
  const currentUser = req.user;

  const enrollment = await enrollmentService.updateEnrollmentProgress(
    enrollmentId,
    progress,
    currentUser
  );

  res.json({
    success: true,
    data: enrollment,
  });
};

const cancelEnrollment = async (req, res) => {
  const enrollmentId = req.params.id;
  const currentUser = req.user;

  const enrollment = await enrollmentService.cancelEnrollment(
    enrollmentId,
    currentUser
  );

  res.json({
    success: true,
    data: enrollment,
  });
};

const getAllEnrollments = async (req, res) => {
  const enrollments = await enrollmentService.getAllEnrollments();

  res.json({
    success: true,
    data: enrollments,
  });
};

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  updateEnrollmentProgress,
  cancelEnrollment,
  getAllEnrollments,
};
