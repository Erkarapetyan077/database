const { test } = require("node:test");
const assert = require("node:assert/strict");

// Never connect to an application database during ordinary npm test.
test("PostgreSQL API regression suite", { skip: process.env.RUN_DB_TESTS !== "1" }, async (t) => {
  assert.match(process.env.DB_NAME || "", /^course_platform_test/);
  const { sequelize } = require("../src/config/database");
  const migrate = require("../src/migrations/run");
  const { User, Course, Lesson, Enrollment } = require("../src/models");
  const { generateToken } = require("../src/utils/jwt");
  const bcrypt = require("bcryptjs");
  let server;
  t.after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    await sequelize.close();
  });
  await migrate();
  await migrate(); // Verify the migration ledger makes reruns safe.
  const suffix = `${Date.now()}`;
  const password = "test-password-123";
  const hash = await bcrypt.hash(password, 4);
  const makeUser = (role) => User.create({ fullName: role, email: `${role}-${suffix}@example.com`, password: hash, role });
  const instructor = await makeUser("instructor"), admin = await makeUser("admin"), student = await makeUser("student");
  const other = await User.create({ fullName: "Other", email: `other-${suffix}@example.com`, password: hash });
  const course = await Course.create({ title: "Public", description: "Test", category: "Testing", price: 10, instructorId: instructor.id, isPublished: true });
  const draft = await Course.create({ title: "Draft", description: "Test", category: "Testing", price: 10, instructorId: instructor.id });
  const lesson = await Lesson.create({ courseId: course.id, title: "Private lesson", content: "secret content", videoUrl: "https://example.com/private", duration: 5, order: 1 });
  server = require("../src/app").listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const request = async (route, { user, token, method = "GET", body } = {}) => {
    const headers = {};
    if (user || token) headers.Authorization = `Bearer ${token || generateToken({ id: user.id })}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const response = await fetch(base + route, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    return { status: response.status, body: await response.json() };
  };
  await t.test("public detail hides private content and unpublished courses", async () => {
    const result = await request(`/courses/${course.id}`);
    assert.equal(result.status, 200);
    assert.equal(result.body.data.lessons.length, 1);
    assert.equal(result.body.data.lessons[0].content, undefined);
    assert.equal(result.body.data.lessons[0].videoUrl, undefined);
    assert.equal((await request(`/courses/${draft.id}`)).status, 404);
    assert.equal((await request("/courses/2147483647")).status, 404);
    assert.equal((await request(`/lessons/${lesson.id}`, { user: student })).status, 403);
    assert.equal((await request(`/lessons/${lesson.id}`, { user: instructor })).body.data.content, "secret content");
  });
  await t.test("malformed IDs, bodies, filters and credentials return client errors", async () => {
    for (const route of ["/courses/nope", "/courses/0", "/courses/9999999999999", "/courses?level=wrong", "/courses?limit=101", "/courses?category=a&category=b"]) {
      assert.equal((await request(route)).status, 400, route);
    }
    for (const body of [{}, [], { fullName: "X", email: "bad", password }]) {
      assert.equal((await request("/auth/register", { method: "POST", body })).status, 400);
    }
    assert.equal((await request("/auth/me", { token: "invalid" })).status, 401);
    const jwt = require("jsonwebtoken");
    assert.equal((await request("/auth/me", { token: jwt.sign({ id: student.id }, process.env.JWT_SECRET, { expiresIn: -1 }) })).status, 401);
  });
  await t.test("registration normalizes email and rejects duplicate concurrent requests", async () => {
    const body = { fullName: "New", email: `New-${suffix}@example.com`, password };
    const results = await Promise.all([request("/auth/register", { method: "POST", body }), request("/auth/register", { method: "POST", body })]);
    assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
    const login = await request("/auth/login", { method: "POST", body: { email: body.email.toUpperCase(), password } });
    assert.equal(login.status, 200);
    assert.equal(login.body.user.password, undefined);
  });
  await t.test("role updates hide hashes, enforce authorization and block self-demotion", async () => {
    assert.equal((await request(`/users/${admin.id}/role`, { user: admin, method: "PATCH", body: { role: "student" } })).status, 400);
    assert.equal((await request(`/users/${other.id}/role`, { user: student, method: "PATCH", body: { role: "admin" } })).status, 403);
    assert.equal((await request(`/users/${other.id}/role`, { user: admin, method: "PATCH", body: { role: "wrong" } })).status, 400);
    const result = await request(`/users/${other.id}/role`, { user: admin, method: "PATCH", body: { role: "instructor" } });
    assert.equal(result.status, 200);
    assert.equal(result.body.data.password, undefined);
  });
  let enrollment;
  await t.test("concurrent enrollment, access checks, completion, cancellation and rejoin", async () => {
    const results = await Promise.all([request(`/enrollments/${course.id}`, { user: student, method: "POST" }), request(`/enrollments/${course.id}`, { user: student, method: "POST" })]);
    assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
    enrollment = results.find((r) => r.status === 201).body.data;
    assert.equal((await request(`/lessons/${lesson.id}`, { user: student })).status, 200);
    assert.equal((await request(`/enrollments/${enrollment.id}/progress`, { user: other, method: "PATCH", body: { progress: 20 } })).status, 403);
    for (const progress of [100, 20]) {
      const result = await request(`/enrollments/${enrollment.id}/progress`, { user: student, method: "PATCH", body: { progress } });
      assert.equal(result.status, 200);
      assert.equal(result.body.data.status, progress === 100 ? "completed" : "active");
    }
    assert.equal((await request(`/enrollments/${enrollment.id}/progress`, { user: student, method: "PATCH", body: { progress: 1.5 } })).status, 400);
    assert.equal((await request(`/enrollments/${enrollment.id}`, { user: student, method: "DELETE" })).status, 200);
    assert.equal((await request(`/lessons/${lesson.id}`, { user: student })).status, 403);
    assert.equal((await request(`/enrollments/${enrollment.id}/progress`, { user: student, method: "PATCH", body: { progress: 20 } })).status, 400);
    const rejoin = await request(`/enrollments/${course.id}`, { user: student, method: "POST" });
    assert.equal(rejoin.status, 201);
    assert.equal(rejoin.body.data.id, enrollment.id);
    assert.equal(rejoin.body.data.progress, 0);
  });
  await t.test("pagination works with aggregate counts and student associations", async () => {
    const list = await request("/courses?limit=1");
    assert.equal(list.status, 200);
    assert.equal(list.body.data.length, 1);
    assert.equal(list.body.data[0].lessonCount, "1");
    const students = await request(`/courses/${course.id}/students?limit=1`, { user: instructor });
    assert.equal(students.status, 200);
    assert.equal(students.body.data.length, 1);
    assert.equal(students.body.data[0].password, undefined);
    for (const route of ["/users?limit=1", "/enrollments?limit=1"]) {
      const result = await request(route, { user: admin });
      assert.equal(result.status, 200);
      assert.equal(result.body.data.length, 1);
    }
  });
  await t.test("mutation validation and ownership checks protect course and lesson data", async () => {
    const lessonBody = { title: "Duplicate", content: "Test", duration: 1, order: 1 };
    assert.equal((await request(`/courses/${course.id}/lessons`, { user: instructor, method: "POST", body: lessonBody })).status, 409);
    assert.equal((await request(`/courses/${course.id}/lessons`, { user: instructor, method: "POST", body: { ...lessonBody, order: 0 } })).status, 400);
    assert.equal((await request(`/courses/${course.id}`, { user: other, method: "PUT", body: { title: "Hijacked" } })).status, 403);
    assert.equal((await request(`/lessons/${lesson.id}`, { user: other, method: "DELETE" })).status, 403);
    assert.equal((await request(`/courses/${course.id}`, { user: instructor, method: "PUT", body: { price: -1 } })).status, 400);
    const lessons = await request(`/lessons/${course.id}/lessons?limit=1`, { user: student });
    assert.equal(lessons.status, 200);
    assert.equal(lessons.body.data.length, 1);
    assert.equal(lessons.body.data[0].content, "secret content");
  });
  await t.test("concurrent cancellation and progress cannot resurrect an enrollment", async () => {
    const results = await Promise.all([
      request(`/enrollments/${enrollment.id}`, { user: student, method: "DELETE" }),
      request(`/enrollments/${enrollment.id}/progress`, { user: student, method: "PATCH", body: { progress: 70 } }),
    ]);
    assert.equal(results[0].status, 200);
    assert.ok([200, 400].includes(results[1].status));
    assert.equal((await Enrollment.findByPk(enrollment.id)).status, "cancelled");
  });
  await t.test("database enforces lesson ordering and numeric constraints", async () => {
    await assert.rejects(Lesson.create({ courseId: course.id, title: "Duplicate", content: "Test", duration: 1, order: 1 }), { name: "SequelizeUniqueConstraintError" });
    await assert.rejects(sequelize.query('UPDATE courses SET price = -1 WHERE id = $id', { bind: { id: course.id } }));
    await assert.rejects(sequelize.query('UPDATE enrollments SET progress = 101 WHERE id = $id', { bind: { id: enrollment.id } }));
  });
});
