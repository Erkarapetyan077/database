const { DataTypes } = require("sequelize");

const { sequelize } = require("../config/database");

const Enrollment = sequelize.define(
  "Enrollment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: "user_course_unique",
      references: {
        model: "users",
        key: "id",
      },
    },

    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: "user_course_unique",
      references: {
        model: "courses",
        key: "id",
      },
    },

    status: {
      type: DataTypes.ENUM("active", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "active",
    },

    progress: {
      type: DataTypes.INTEGER,
      validate: { min: 0, max: 100, isInt: true },
      allowNull: false,
      defaultValue: 0,
    },

    enrolledAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "enrollments",
    timestamps: true,
  }
);

module.exports = Enrollment;
