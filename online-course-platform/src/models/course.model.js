const { DataTypes } = require("sequelize");

const { sequelize } = require("../config/database");

const Course = sequelize.define(
  "Course",
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

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    level: {
      type: DataTypes.ENUM("beginner", "intermediate", "advanced"),
      allowNull: false,
      defaultValue: "beginner",
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      validate: { min: 0 },
      allowNull: false,
    },

    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    instructorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "courses",
    timestamps: true,
  }
);

module.exports = Course;
