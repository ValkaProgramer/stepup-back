module.exports = (sequelize, DataTypes) => {
  const Friendship = sequelize.define("Friendship", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId1: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId2: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "blocked"),
      defaultValue: "pending",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  Friendship.associate = (models) => {
    Friendship.belongsTo(models.User, {
      as: "user1Details",
      foreignKey: "userId1",
    });
    Friendship.belongsTo(models.User, {
      as: "user2Details",
      foreignKey: "userId2",
    });
  };
  return Friendship;
};
