const { Op } = require("sequelize");
const roomRepository = require("@/repositories/roomRepository");

class AdminRoomService {
  constructor(repository) {
    this.repository = repository;
  }

  async getReportedRooms() {
    const rooms = await this.repository.getList({
      where: {
        reportedCount: {
          [Op.gt]: 0,
        },
        status: {
          [Op.ne]: "deleted",
        },
      },
      order: [["reportedCount", "DESC"]],
    });

    return rooms;
  }

  async deleteViolationRoom(roomId) {
    const room = await this.repository.getById(roomId);

    if (!room || room.status === "deleted") {
      return { status: 404, data: { message: "Room not found" } };
    }

    await this.repository.updateById(roomId, { status: "deleted" });
    return { status: 200, data: { message: "Room removed" } };
  }
}

module.exports = new AdminRoomService(roomRepository);
