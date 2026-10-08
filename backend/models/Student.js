const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Student = sequelize.define("Student", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    rollNo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },

    course: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    marks: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0,
            max: 100,
        },
    },
});

module.exports = Student;