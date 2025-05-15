module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    height: DataTypes.FLOAT,
    weight: DataTypes.FLOAT,
    preferences: DataTypes.JSON, // optional: for storing settings
  });

  User.associate = (models) => {
    User.hasMany(models.Reminder, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });

    User.belongsToMany(models.User, {
      as: "Friends",
      through: models.Friendship,
      foreignKey: "userId1",
      otherKey: "userId2",
    });
  };

  return User;
};