require("module-alias/register");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const bcrypt = require("bcryptjs");
const { ensureDatabaseExists } = require("@/config/database");
const {
  sequelize,
  User,
  Room,
  RoomImage,
  Favorite,
  Review,
  Appointment,
  Message,
} = require("@/entities");
const { seedDefaultAdmin } = require("@/seeders/adminSeed");

const shouldReset = String(process.env.SEED_RESET || "true") === "true";

const hashPassword = (plainText) => bcrypt.hash(plainText, 10);

const createUsers = async () => {
  const passwordHash = await hashPassword("123456");

  const [customerA, customerB, landlordA, landlordB] = await Promise.all([
    User.create({
      fullName: "Nguyen Minh Hung",
      email: "customer1@example.com",
      passwordHash,
      role: "customer",
      phone: "0901000001",
      area: "Quận 7",
      isActive: true,
    }),
    User.create({
      fullName: "Tran Thanh Lan",
      email: "customer2@example.com",
      passwordHash,
      role: "customer",
      phone: "0901000002",
      area: "Bình Thạnh",
      isActive: true,
    }),
    User.create({
      fullName: "Pham Quoc Anh",
      email: "landlord1@example.com",
      passwordHash,
      role: "landlord",
      phone: "0902000001",
      area: "Quận 3",
      isActive: true,
    }),
    User.create({
      fullName: "Le My Linh",
      email: "landlord2@example.com",
      passwordHash,
      role: "landlord",
      phone: "0902000002",
      area: "Thủ Đức",
      isActive: true,
    }),
  ]);

  return { customerA, customerB, landlordA, landlordB };
};

const createRooms = async ({ landlordA, landlordB }) => {
  const rooms = await Room.bulkCreate([
    {
      landlordId: landlordA.id,
      title: "Studio full nội thất gần trung tâm",
      description: "Phòng sạch đẹp, có ban công, giờ giấc tự do.",
      price: 3500000,
      area: "Quận 3",
      address: "123 Nguyen Trai, Quan 3, TP.HCM",
      status: "active",
      reportedCount: 0,
    },
    {
      landlordId: landlordA.id,
      title: "Phòng trọ cao cấp gần đại học RMIT",
      description: "An ninh tốt, camera 24/7, bãi xe rộng.",
      price: 4200000,
      area: "Quận 7",
      address: "45 Nguyen Huu Tho, Quan 7, TP.HCM",
      status: "active",
      reportedCount: 2,
    },
    {
      landlordId: landlordB.id,
      title: "Căn hộ mini 1PN tại Bình Thạnh",
      description: "Đầy đủ nội thất, phù hợp người đi làm.",
      price: 5200000,
      area: "Bình Thạnh",
      address: "99 Dien Bien Phu, Binh Thanh, TP.HCM",
      status: "active",
      reportedCount: 1,
    },
    {
      landlordId: landlordB.id,
      title: "Phòng giá tốt cho sinh viên Thủ Đức",
      description: "Gần trường, chợ, tiện ích đầy đủ.",
      price: 2800000,
      area: "Thủ Đức",
      address: "12 Vo Van Ngan, Thu Duc, TP.HCM",
      status: "active",
      reportedCount: 0,
    },
  ]);

  return rooms;
};

const createRoomImages = async (rooms) => {
  const images = [];

  rooms.forEach((room) => {
    images.push(
      { roomId: room.id, imageUrl: "/uploads/demo-room-1.jpg" },
      { roomId: room.id, imageUrl: "/uploads/demo-room-2.jpg" }
    );
  });

  await RoomImage.bulkCreate(images);
};

const createFavorites = async ({ customerA, customerB }, rooms) => {
  await Favorite.bulkCreate([
    { userId: customerA.id, roomId: rooms[0].id },
    { userId: customerA.id, roomId: rooms[2].id },
    { userId: customerB.id, roomId: rooms[1].id },
  ]);
};

const createReviews = async ({ customerA, customerB }, rooms) => {
  await Review.bulkCreate([
    {
      userId: customerA.id,
      roomId: rooms[0].id,
      rating: 5,
      content: "Phòng đúng mô tả, chủ trọ thân thiện.",
    },
    {
      userId: customerB.id,
      roomId: rooms[0].id,
      rating: 4,
      content: "Vị trí tiện lợi, giá hợp lý.",
    },
    {
      userId: customerA.id,
      roomId: rooms[2].id,
      rating: 5,
      content: "Nội thất đẹp, vào ở ngay được.",
    },
  ]);
};

const createAppointments = async ({ customerA, customerB, landlordA, landlordB }, rooms) => {
  const now = Date.now();

  return Appointment.bulkCreate([
    {
      roomId: rooms[0].id,
      customerId: customerA.id,
      landlordId: landlordA.id,
      scheduledAt: new Date(now + 24 * 60 * 60 * 1000),
      note: "Mình muốn xem buổi tối",
      status: "pending",
    },
    {
      roomId: rooms[1].id,
      customerId: customerB.id,
      landlordId: landlordA.id,
      scheduledAt: new Date(now + 2 * 24 * 60 * 60 * 1000),
      note: "Xem phòng cuối tuần",
      status: "approved",
    },
    {
      roomId: rooms[2].id,
      customerId: customerA.id,
      landlordId: landlordB.id,
      scheduledAt: new Date(now + 3 * 24 * 60 * 60 * 1000),
      note: "Có chỗ gửi xe không?",
      status: "rejected",
    },
  ]);
};

const createMessages = async ({ customerA, customerB, landlordA, landlordB }, rooms) => {
  await Message.bulkCreate([
    {
      roomId: rooms[0].id,
      senderId: customerA.id,
      receiverId: landlordA.id,
      content: "Chào anh/chị, phòng còn trống không ạ?",
      isRead: true,
    },
    {
      roomId: rooms[0].id,
      senderId: landlordA.id,
      receiverId: customerA.id,
      content: "Chào em, phòng vẫn còn nhé.",
      isRead: true,
    },
    {
      roomId: rooms[1].id,
      senderId: customerB.id,
      receiverId: landlordA.id,
      content: "Cho em đặt lịch xem phòng thứ 7 được không?",
      isRead: false,
    },
    {
      roomId: rooms[2].id,
      senderId: customerA.id,
      receiverId: landlordB.id,
      content: "Phòng có máy lạnh chưa ạ?",
      isRead: false,
    },
  ]);
};

const resetData = async () => {
  await Message.destroy({ where: {}, force: true });
  await Appointment.destroy({ where: {}, force: true });
  await Review.destroy({ where: {}, force: true });
  await Favorite.destroy({ where: {}, force: true });
  await RoomImage.destroy({ where: {}, force: true });
  await Room.destroy({ where: {}, force: true });
  await User.destroy({ where: { role: ["customer", "landlord"] }, force: true });
};

const run = async () => {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    await sequelize.sync({ alter: String(process.env.DB_SYNC_ALTER || "true") === "true" });

    if (shouldReset) {
      await resetData();
    }

    const users = await createUsers();
    const rooms = await createRooms(users);

    await createRoomImages(rooms);
    await createFavorites(users, rooms);
    await createReviews(users, rooms);
    await createAppointments(users, rooms);
    await createMessages(users, rooms);
    await seedDefaultAdmin();

    console.log("Seed completed successfully.");
    console.log("Demo accounts: customer1@example.com, customer2@example.com, landlord1@example.com, landlord2@example.com");
    console.log("Default password: 123456");
    console.log("Admin account from ADMIN_EMAIL/ADMIN_PASSWORD or default admin@example.com/admin123");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

run();
