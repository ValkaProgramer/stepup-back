module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Reminders", "time", {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        is: /^((Mon|Tue|Wed|Thu|Fri|Sat|Sun) )?\d{2}:\d{2}$/,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Reminders", "time", {
      type: Sequelize.TIME,
      allowNull: false,
    });
  },
};
