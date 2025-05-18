module.exports = (sequelize, DataTypes) => {
  const Reminder = sequelize.define("Reminder", {
    time: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^((Mon|Tue|Wed|Thu|Fri|Sat|Sun) )?\d{2}:\d{2}$/,
      },
    },
    activity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recurrence: {
      type: DataTypes.STRING,
      defaultValue: "daily",
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });

  Reminder.associate = (models) => {
    Reminder.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
  };

  return Reminder;
};
