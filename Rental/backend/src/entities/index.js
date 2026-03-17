const { sequelize } = require("@/config/database");

const User = require("@/entities/user")(sequelize);
const Room = require("@/entities/room")(sequelize);
const RoomImage = require("@/entities/roomImage")(sequelize);
const Favorite = require("@/entities/favorite")(sequelize);
const Review = require("@/entities/review")(sequelize);
const Appointment = require("@/entities/appointment")(sequelize);
const Message = require("@/entities/message")(sequelize);
const RoomReport = require("@/entities/roomReport")(sequelize);

User.hasMany(Room, { foreignKey: "landlordId", as: "rooms" });
Room.belongsTo(User, { foreignKey: "landlordId", as: "landlord" });

Room.hasMany(RoomImage, { foreignKey: "roomId", as: "images" });
RoomImage.belongsTo(Room, { foreignKey: "roomId", as: "room" });

User.belongsToMany(Room, {
  through: Favorite,
  foreignKey: "userId",
  otherKey: "roomId",
  as: "favoriteRooms",
});
Room.belongsToMany(User, {
  through: Favorite,
  foreignKey: "roomId",
  otherKey: "userId",
  as: "favoritedBy",
});
Favorite.belongsTo(User, { foreignKey: "userId", as: "user" });
Favorite.belongsTo(Room, { foreignKey: "roomId", as: "room" });

User.hasMany(Review, { foreignKey: "userId", as: "reviews" });
Review.belongsTo(User, { foreignKey: "userId", as: "reviewer" });
Room.hasMany(Review, { foreignKey: "roomId", as: "reviews" });
Review.belongsTo(Room, { foreignKey: "roomId", as: "room" });

Room.hasMany(Appointment, { foreignKey: "roomId", as: "appointments" });
Appointment.belongsTo(Room, { foreignKey: "roomId", as: "room" });
User.hasMany(Appointment, { foreignKey: "customerId", as: "customerAppointments" });
User.hasMany(Appointment, { foreignKey: "landlordId", as: "landlordAppointments" });
Appointment.belongsTo(User, { foreignKey: "customerId", as: "customer" });
Appointment.belongsTo(User, { foreignKey: "landlordId", as: "landlord" });

User.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" });
User.hasMany(Message, { foreignKey: "receiverId", as: "receivedMessages" });
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
Message.belongsTo(User, { foreignKey: "receiverId", as: "receiver" });
Room.hasMany(Message, { foreignKey: "roomId", as: "messages" });
Message.belongsTo(Room, { foreignKey: "roomId", as: "room" });

Room.hasMany(RoomReport, { foreignKey: "roomId", as: "reports" });
RoomReport.belongsTo(Room, { foreignKey: "roomId", as: "room" });
User.hasMany(RoomReport, { foreignKey: "reporterId", as: "submittedRoomReports" });
RoomReport.belongsTo(User, { foreignKey: "reporterId", as: "reporter" });

module.exports = {
  sequelize,
  User,
  Room,
  RoomImage,
  Favorite,
  Review,
  Appointment,
  Message,
  RoomReport,
};
