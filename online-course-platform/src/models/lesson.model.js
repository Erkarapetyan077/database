const { DataTypes } = require("sequelize");

const { sequelize } = require("../config/database");

const Lesson = sequelize.define(
  "Lesson",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    videoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "courses",
        key: "id",
      },
    },
  },
  {
    tableName: "lessons",
    timestamps: true,
    indexes: [{ name: "lessons_course_order_unique", unique: true, fields: ["courseId", "order"] }],
  }
);

module.exports = Lesson;
