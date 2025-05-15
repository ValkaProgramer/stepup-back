module.exports = (sequelize, DataTypes) => {
  const Reminder = sequelize.define("Reminder", {
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    activity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recurrence: {
      type: DataTypes.STRING, // daily, weekly, etc. or cron-like
      defaultValue: "daily",
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // active by default
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
