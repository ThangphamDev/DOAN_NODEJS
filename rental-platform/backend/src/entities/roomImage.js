const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "RoomImage",
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
      imageUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
    },
    {
      tableName: "room_images",
      timestamps: true,
    }
  );
