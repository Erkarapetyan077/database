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

module.exports = {
  enrollInCourse,
  getMyEnrollments
};
