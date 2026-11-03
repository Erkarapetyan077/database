const bcrypt = require("bcryptjs");

const { sequelize } = require("../config/database");
const { User, Course, Lesson } = require("../models");

async function seed() {
  try {
    await sequelize.authenticate();

    console.log("Database connected");

    await sequelize.sync();

    const password = await bcrypt.hash("Password123!", 10);

    const [admin] = await User.findOrCreate({
      where: {
        email: "admin@example.com",
      },
      defaults: {
        fullName: "Platform Admin",
        email: "admin@example.com",
        password,
        role: "admin",
      },
    });

    const [instructor] = await User.findOrCreate({
      where: {
        email: "instructor@example.com",
      },
      defaults: {
        fullName: "Course Instructor",
        email: "instructor@example.com",
        password,
        role: "instructor",
      },
    });

    await User.findOrCreate({
      where: {
        email: "student@example.com",
      },
      defaults: {
        fullName: "Test Student",
        email: "student@example.com",
        password,
        role: "student",
      },
    });

    console.log("Users created or already exist");

    const [course] = await Course.findOrCreate({
      where: {
        title: "Node.js Backend Basics",
        instructorId: instructor.id,
      },
      defaults: {
        title: "Node.js Backend Basics",
        description: "Learn Node.js and Express from the beginning",
        category: "Backend",
        level: "beginner",
        price: 80,
        isPublished: true,
        instructorId: instructor.id,
      },
    });

    const lessons = [
      {
        title: "Introduction to Node.js",
        content: "Learn what Node.js is and how it works.",
        videoUrl: null,
        duration: 20,
        order: 1,
      },
      {
        title: "Introduction to Express",
        content: "Learn how to create an Express server.",
        videoUrl: null,
        duration: 30,
        order: 2,
      },
    ];

    for (const lessonData of lessons) {
      await Lesson.findOrCreate({
        where: {
          courseId: course.id,
          order: lessonData.order,
        },
        defaults: {
          ...lessonData,
          courseId: course.id,
        },
      });
    }

    console.log("Seed completed successfully");
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
