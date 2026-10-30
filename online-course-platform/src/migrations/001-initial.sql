DO $$ BEGIN
  CREATE TYPE "enum_users_role" AS ENUM ('admin', 'instructor', 'student');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "enum_courses_level" AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "enum_enrollments_status" AS ENUM ('active', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY, "fullName" VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL,
  role "enum_users_role" NOT NULL DEFAULT 'student',
  "createdAt" TIMESTAMPTZ NOT NULL, "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT NOT NULL,
  category VARCHAR(255) NOT NULL, level "enum_courses_level" NOT NULL DEFAULT 'beginner',
  price DECIMAL(10,2) NOT NULL, "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "instructorId" INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  "createdAt" TIMESTAMPTZ NOT NULL, "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, content TEXT NOT NULL,
  "videoUrl" VARCHAR(255), duration INTEGER NOT NULL, "order" INTEGER NOT NULL,
  "courseId" INTEGER NOT NULL REFERENCES courses(id) ON UPDATE CASCADE ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL, "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS enrollments (
  id SERIAL PRIMARY KEY, "userId" INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  "courseId" INTEGER NOT NULL REFERENCES courses(id) ON UPDATE CASCADE ON DELETE CASCADE,
  status "enum_enrollments_status" NOT NULL DEFAULT 'active', progress INTEGER NOT NULL DEFAULT 0,
  "enrolledAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "createdAt" TIMESTAMPTZ NOT NULL, "updatedAt" TIMESTAMPTZ NOT NULL,
  UNIQUE ("userId", "courseId")
);
