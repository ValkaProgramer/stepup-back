module.exports = (sequelize, DataTypes) => {
  const Friendship = sequelize.define("Friendship", {
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

  return Friendship;
};
