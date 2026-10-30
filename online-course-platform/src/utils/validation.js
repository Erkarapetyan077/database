const AppError = require("./AppError");
const ROLES = require("../constants/roles");

const invalid = (message) => {
  throw new AppError(message, 400);
};

const text = (value, name, max = 255) => {
  if (typeof value !== "string" || !value.trim() || value.length > max) {
    invalid(`${name} must be a non-empty string of at most ${max} characters`);
  }
};

const integer = (value, name, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    invalid(`${name} must be an integer between ${min} and ${max}`);
  }
};

const choice = (value, name, values) => {
  if (!values.includes(value)) {
    invalid(`${name} must be one of: ${values.join(", ")}`);
  }
};

const credentials = (email, password, registration = false) => {
  text(email, "email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    invalid("Invalid email address");
  }
  if (
    typeof password !== "string" || !password ||
    Buffer.byteLength(password) > 72 || (registration && password.length < 8)
  ) {
    invalid("Password must contain at least 8 characters for registration and at most 72 bytes");
  }
};

const course = (data, partial = false) => {
  for (const name of ["title", "description", "category"]) {
    if (!partial || data[name] !== undefined) {
      text(data[name], name, name === "description" ? 100000 : 255);
    }
  }
  if (data.level !== undefined) {
    choice(data.level, "level", ["beginner", "intermediate", "advanced"]);
  }
  if (!partial || data.price !== undefined) {
    const price = data.price;
    if (
      typeof price !== "number" || !Number.isFinite(price) || price < 0 ||
      price > 99999999.99 || Math.abs(price * 100 - Math.round(price * 100)) > 0.000001
    ) {
      invalid("price must be a non-negative amount with at most two decimal places");
    }
  }
  if (data.isPublished !== undefined && typeof data.isPublished !== "boolean") {
    invalid("isPublished must be boolean");
  }
};

const lesson = (data, partial = false) => {
  for (const name of ["title", "content"]) {
    if (!partial || data[name] !== undefined) {
      text(data[name], name, name === "content" ? 100000 : 255);
    }
  }
  for (const name of ["duration", "order"]) {
    if (!partial || data[name] !== undefined) {
      integer(data[name], name, name === "order" ? 1 : 0, 2147483647);
    }
  }
  if (data.videoUrl !== undefined && data.videoUrl !== null) {
    text(data.videoUrl, "videoUrl");
    let url;
    try {
      url = new URL(data.videoUrl);
    } catch {
      invalid("videoUrl must be an HTTP or HTTPS URL");
    }
    if (!["http:", "https:"].includes(url.protocol)) {
      invalid("videoUrl must be an HTTP or HTTPS URL");
    }
  }
};

const pagination = (query = {}) => {
  const parse = (value, fallback, name, max) => {
    if (value === undefined) return fallback;
    if (typeof value !== "string" || !/^\d+$/.test(value)) invalid(`Invalid ${name}`);
    const result = Number(value);
    integer(result, name, 1, max);
    return result;
  };
  const page = parse(query.page, 1, "page", 1000000);
  const limit = parse(query.limit, 20, "limit", 100);
  return { limit, offset: (page - 1) * limit };
};

const role = (value) => choice(value, "role", Object.values(ROLES));

module.exports = { text, integer, choice, credentials, course, lesson, pagination, role };
