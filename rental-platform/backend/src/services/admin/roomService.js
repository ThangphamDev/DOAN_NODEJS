const { Op } = require("sequelize");
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
      order: [["reportedCount", "DESC"]],
    });
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
