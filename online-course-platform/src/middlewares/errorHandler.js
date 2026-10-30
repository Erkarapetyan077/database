const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message;
  if (["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(err.name)) {
    statusCode = 401;
    message = "Invalid or expired authentication token";
  } else if (err.name === "SequelizeUniqueConstraintError") {
    statusCode = 409;
    message = "A record with these unique values already exists";
  } else if (["SequelizeValidationError", "SequelizeForeignKeyConstraintError"].includes(err.name)) {
    statusCode = 400;
    message = "Invalid request data";
  }
  if (err.name === "SequelizeDatabaseError" && err.parent?.code === "23514") {
    statusCode = 400;
    message = "Invalid request data";
  }
  if (statusCode >= 500) {
    console.error(err);
    message = "Something went wrong";
  }
  res.status(statusCode).json({ success: false, statusCode, message });
};
module.exports = errorHandler;
