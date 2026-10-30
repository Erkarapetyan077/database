-- Existing invalid data must be corrected explicitly; this migration never deletes it.
CREATE UNIQUE INDEX lessons_course_order_unique ON lessons ("courseId", "order");
CREATE INDEX courses_instructor_idx ON courses ("instructorId");
CREATE INDEX enrollments_course_idx ON enrollments ("courseId");
ALTER TABLE courses ADD CONSTRAINT courses_price_nonnegative CHECK (price >= 0);
ALTER TABLE lessons ADD CONSTRAINT lessons_duration_nonnegative CHECK (duration >= 0);
ALTER TABLE lessons ADD CONSTRAINT lessons_order_positive CHECK ("order" >= 1);
ALTER TABLE enrollments ADD CONSTRAINT enrollments_progress_range CHECK (progress BETWEEN 0 AND 100);
-- Repair the known progress/status inconsistency while preserving cancellations.
UPDATE enrollments SET status = CASE WHEN progress = 100 THEN 'completed'::"enum_enrollments_status"
  ELSE 'active'::"enum_enrollments_status" END WHERE status <> 'cancelled';
ALTER TABLE enrollments ADD CONSTRAINT enrollments_progress_status CHECK (
  status = 'cancelled' OR (status = 'completed' AND progress = 100) OR (status = 'active' AND progress < 100)
);

-- Normalize existing accounts consistently with registration and login. Conflicting
-- case variants fail the transaction instead of silently merging user accounts.
UPDATE users SET email = lower(btrim(email));
CREATE UNIQUE INDEX users_email_normalized_unique ON users (lower(btrim(email)));
