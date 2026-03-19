const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "RoomReport",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      roomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reporterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING(150),
        allowNull: false,
        defaultValue: "Bao cao vi pham",
      },
      details: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.ENUM("pending", "resolved", "deleted", "dismissed"),
        allowNull: false,
        defaultValue: "pending",
      },
      reviewedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "room_reports",
      timestamps: true,
    }
  );
