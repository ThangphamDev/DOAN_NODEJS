const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "Review",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      roomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "reviews",
      timestamps: true,
      validate: {
        isValidRating() {
          if (this.rating < 1 || this.rating > 5) {
            throw new Error("Rating must be between 1 and 5");
          }
        },
      },
      indexes: [{ unique: true, fields: ["userId", "roomId"] }],
    }
  );
