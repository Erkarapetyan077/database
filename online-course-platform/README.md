# Online course platform

Express 5 API backed by PostgreSQL and Sequelize. Requires Node.js 22 and PostgreSQL 17.

## Setup

1. Run `npm ci` and copy `.env.example` to `.env`.
2. Set database credentials and a unique JWT secret. Provision the database separately with an administrator account; the application does not create databases or change schema at startup.
3. Run `npm run migrate` using an account allowed to change schema.
4. Optionally set `SEED_PASSWORD` (8 characters minimum, 72 bytes maximum) and run `npm run seed` in development. Seeding is disabled in production.
5. Run `npm start` with an application database account.

Migrations are versioned SQL files, applied in one transaction under a PostgreSQL advisory lock. Existing installations are supported: the initial migration preserves existing tables. The integrity migration fails without deleting data if existing prices, durations, lesson positions, or progress values are invalid, or if lesson positions or normalized emails conflict. Resolve those records deliberately, then rerun migrations. Back up production databases before migration. Never edit an applied migration; add a new numbered SQL file.

## API behavior

- Public course details return published courses and lesson metadata only. Full lesson content and video URLs require authentication and an active/completed enrollment, course ownership, or administrator access through `/api/lessons/:id` or `/api/lessons/:courseId/lessons`.
- Missing and unpublished public courses return `404`.
- Collection endpoints accept `page` (default 1) and `limit` (default 20, maximum 100). Arrays remain inside `data`, ordered by ID. Lesson lists are ordered by lesson position.
- Course prices are JSON numbers with at most two decimal places; progress is an integer from 0 to 100. Lesson positions start at 1 and are unique within a course; duration is a non-negative integer.
- Progress below 100 sets enrollment status to active; 100 sets it to completed. Cancelled enrollments reject progress changes. Rejoining a published course reactivates the same enrollment with progress reset to 0.
- Admins cannot change their own role or delete themselves. Responses omit password hashes.
- Registration and login normalize email case and surrounding whitespace. New passwords must be at least 8 characters and no more than 72 UTF-8 bytes.
- Login and registration share a per-process limit of 20 attempts per client IP per 10 minutes. For multiple replicas, enforce a shared limit at the gateway. Express uses the direct peer IP by default; configure trusted proxy addresses deliberately before deploying behind a proxy.
- Expected input errors return `400`, invalid/expired tokens `401`, forbidden access `403`, and uniqueness conflicts `409`. Unexpected errors are logged and return a generic `500`.

## Verification

`npm test` runs unit tests without connecting to a database. Integration tests are opt-in and require a **dedicated disposable database**, with a name starting with `course_platform_test`. They apply migrations and insert fixtures; never point them at an application database.

```sh
RUN_DB_TESTS=1 DB_HOST=127.0.0.1 DB_PORT=5432 \
DB_NAME=course_platform_test DB_USER=test_user DB_PASSWORD=test_password \
DB_DIALECT=postgres JWT_SECRET=test-only-secret JWT_EXPIRES_IN=1h npm test
```

`TESTING.md` contains historical manual examples; use the regression suite for the current validation and authorization contract.
