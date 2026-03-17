const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "UserBlock",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      blockerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      blockedUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "user_blocks",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["blockerId", "blockedUserId"],
        },
      ],
    }
  );
