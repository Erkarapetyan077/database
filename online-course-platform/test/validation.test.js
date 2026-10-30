const { test } = require("node:test");
const assert = require("node:assert/strict");
const validation = require("../src/utils/validation");
const errorHandler = require("../src/middlewares/errorHandler");
const rateLimit = require("../src/middlewares/authRateLimit");

test("credentials reject missing, weak, oversized and invalid inputs", () => {
  for (const [email, password] of [[undefined, undefined], ["bad", "password123"], ["a@b.co", "short"], ["a@b.co", "a".repeat(73)]]) {
    assert.throws(() => validation.credentials(email, password, true), { statusCode: 400 });
  }
  validation.credentials("a@b.co", "strong-password", true);
});
test("course and lesson validation reject invalid financial and ordering data", () => {
  const course = { title: "Course", description: "Description", category: "Code", price: 10 };
  for (const price of [-1, NaN, Infinity, "10", 1.001]) assert.throws(() => validation.course({ ...course, price }));
  validation.course(course);
  const lesson = { title: "Lesson", content: "Content", duration: 10, order: 1 };
  for (const change of [{ order: 0 }, { duration: -1 }, { duration: 1.5 }, { videoUrl: "javascript:alert(1)" }]) {
    assert.throws(() => validation.lesson({ ...lesson, ...change }));
  }
  validation.lesson(lesson);
});
test("pagination defaults and limits are bounded", () => {
  assert.deepEqual(validation.pagination(), { limit: 20, offset: 0 });
  assert.deepEqual(validation.pagination({ page: "2", limit: "10" }), { limit: 10, offset: 10 });
  for (const query of [{ limit: "101" }, { page: "0" }, { page: [] }, { page: "1.5" }]) assert.throws(() => validation.pagination(query));
});
test("JWT and database errors receive safe status codes", () => {
  for (const [name, expected] of [["TokenExpiredError", 401], ["JsonWebTokenError", 401], ["SequelizeUniqueConstraintError", 409], ["SequelizeValidationError", 400]]) {
    let status, body;
    errorHandler(Object.assign(new Error("internal details"), { name }), {}, { status(s) { status = s; return this; }, json(b) { body = b; } });
    assert.equal(status, expected);
    assert.notEqual(body.message, "internal details");
  }
});
test("authentication limiter bounds attempts and client memory", () => {
  const middleware = rateLimit({ max: 1, maxClients: 1 });
  let allowed = 0, status;
  const res = { set() {}, status(s) { status = s; return this; }, json() {} };
  middleware({ ip: "one" }, res, () => allowed++);
  middleware({ ip: "one" }, res, () => allowed++);
  assert.equal(allowed, 1);
  assert.equal(status, 429);
  middleware({ ip: "two" }, res, () => allowed++);
  assert.equal(allowed, 1);
});

test("unexpected exceptions hide details and delegate when headers are already sent", (t) => {
  t.mock.method(console, "error", () => {});
  let body;
  errorHandler(new Error("database password and SQL"), {}, {
    status(code) { assert.equal(code, 500); return this; },
    json(value) { body = value; },
  });
  assert.equal(body.message, "Something went wrong");
  const error = new Error("sent");
  errorHandler(error, {}, { headersSent: true }, (value) => assert.equal(value, error));
});
