'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Reminders", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      activity: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      recurrence: {
        type: Sequelize.STRING,
        defaultValue: "daily",
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Reminders");
  },
};