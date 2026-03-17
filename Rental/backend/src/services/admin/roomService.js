const { Op } = require("sequelize");
const { RoomImage, RoomReport, User } = require("@/entities");
const roomRepository = require("@/repositories/roomRepository");
const ApiError = require("@/utils/ApiError");

class AdminRoomService {
  constructor(repository) {
    this.repository = repository;
  }

  async getReportedRooms() {
    return this.repository.getList({
      where: {
        reportedCount: { [Op.gt]: 0 },
        status: { [Op.ne]: "deleted" },
      },
      include: [
        { model: User, as: "landlord", attributes: ["id", "fullName", "email", "phone"] },
        { model: RoomImage, as: "images" },
      ],
      order: [["reportedCount", "DESC"]],
    });
  }

  async getReportedRoomDetail(roomId) {
    const room = await this.repository.getById(roomId, {
      include: [
        { model: User, as: "landlord", attributes: ["id", "fullName", "email", "phone"] },
        { model: RoomImage, as: "images" },
        {
          model: RoomReport,
          as: "reports",
          separate: true,
          order: [["createdAt", "DESC"]],
          include: [{ model: User, as: "reporter", attributes: ["id", "fullName", "email"] }],
        },
      ],
    });

    if (!room || room.status === "deleted") {
      throw new ApiError(404, "Room not found");
    }

    return {
      ...room.toJSON(),
      roomLink: `/rooms/${room.id}`,
    };
  }

  async deleteViolationRoom(roomId, options = {}) {
    const room = await this.repository.getById(roomId);

    if (!room || room.status === "deleted") {
      throw new ApiError(404, "Room not found");
    }

    await this.repository.updateById(roomId, { status: "deleted" }, options);
    return { message: "Room removed" };
  }
}

module.exports = new AdminRoomService(roomRepository);
