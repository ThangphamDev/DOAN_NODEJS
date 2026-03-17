const { Op } = require("sequelize");
const { Room, RoomImage, RoomReport, User } = require("@/entities");
const roomRepository = require("@/repositories/roomRepository");
const roomReportRepository = require("@/repositories/roomReportRepository");
const ApiError = require("@/utils/ApiError");

class AdminRoomService {
  constructor(repository, reportRepository) {
    this.repository = repository;
    this.reportRepository = reportRepository;
  }

  async getReportedRooms() {
    const reports = await this.reportRepository.getList({
      where: {
        status: "pending",
      },
      include: [
        {
          model: Room,
          as: "room",
          where: {
            status: { [Op.ne]: "deleted" },
          },
          include: [
            { model: User, as: "landlord", attributes: ["id", "fullName", "email", "phone"] },
            { model: RoomImage, as: "images" },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const groupedRooms = new Map();

    reports.forEach((report) => {
      const room = report.room?.toJSON?.() || report.room;
      if (!room) {
        return;
      }

      const roomItem = groupedRooms.get(room.id) || {
        ...room,
        reportedCount: 0,
        latestReportReason: report.reason,
        latestReportAt: report.createdAt,
      };

      roomItem.reportedCount += 1;
      if (!roomItem.latestReportAt || new Date(report.createdAt) > new Date(roomItem.latestReportAt)) {
        roomItem.latestReportAt = report.createdAt;
        roomItem.latestReportReason = report.reason;
      }

      groupedRooms.set(room.id, roomItem);
    });

    return Array.from(groupedRooms.values()).sort(
      (left, right) => Number(right.reportedCount || 0) - Number(left.reportedCount || 0)
    );
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

  async getReportedContent({ status = "pending" } = {}) {
    const where = {};

    if (status && status !== "all") {
      where.status = status;
    }

    const reports = await this.reportRepository.getList({
      where,
      include: [
        { model: User, as: "reporter", attributes: ["id", "fullName", "email"] },
        {
          model: Room,
          as: "room",
          include: [
            { model: User, as: "landlord", attributes: ["id", "fullName", "email", "phone"] },
            { model: RoomImage, as: "images" },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return reports.map((report) => {
      const payload = report.toJSON();

      return {
        ...payload,
        roomLink: payload.room ? `/rooms/${payload.room.id}` : null,
      };
    });
  }

  async updateReportStatus(reportId, status, options = {}) {
    if (!["pending", "resolved", "dismissed"].includes(status)) {
      throw new ApiError(400, "Invalid report status");
    }

    const report = await this.reportRepository.getById(reportId, {
      include: [{ model: Room, as: "room" }],
    });

    if (!report) {
      throw new ApiError(404, "Report not found");
    }

    await this.reportRepository.updateById(
      reportId,
      {
        status,
        reviewedAt: new Date(),
      },
      options
    );

    return {
      message: status === "dismissed" ? "Report dismissed" : "Report updated",
      reportId: report.id,
      status,
    };
  }

  async deleteViolationRoom(roomId, options = {}) {
    const room = await this.repository.getById(roomId);

    if (!room || room.status === "deleted") {
      throw new ApiError(404, "Room not found");
    }

    await this.repository.updateById(roomId, { status: "deleted" }, options);
    await this.reportRepository.updateWhere(
      { roomId, status: "pending" },
      { status: "resolved", reviewedAt: new Date() },
      options
    );
    return { message: "Room removed" };
  }
}

module.exports = new AdminRoomService(roomRepository, roomReportRepository);
