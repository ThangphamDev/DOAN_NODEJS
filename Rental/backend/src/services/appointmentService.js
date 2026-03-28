const { Room, User } = require("@/entities");
const appointmentRepository = require("@/repositories/appointmentRepository");
const roomRepository = require("@/repositories/roomRepository");
const ApiError = require("@/utils/ApiError");
const { Op } = require("sequelize");

class AppointmentService {
  constructor(repository, roomRepo) {
    this.repository = repository;
    this.roomRepository = roomRepo;
  }

  async createAppointment({ userId, roomId, scheduledAt, note, phone }, options = {}) {
    if (!scheduledAt) {
      throw new ApiError(400, "scheduledAt is required");
    }

    const room = await this.roomRepository.getById(roomId);
    if (!room || room.status !== "active") {
      throw new ApiError(404, "Room not found");
    }

    const scheduleDate = new Date(scheduledAt);
    const startOfDay = new Date(scheduleDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(scheduleDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await this.repository.getList({
      where: {
        roomId,
        customerId: userId,
        scheduledAt: {
          [Op.between]: [startOfDay, endOfDay]
        },
        status: {
          [Op.notIn]: ["cancelled", "rejected"]
        }
      }
    });

    if (existingAppointments && existingAppointments.length > 0) {
      throw new ApiError(400, "Bạn đã đặt lịch cho phòng trọ này trong ngày hôm nay rồi.");
    }

    const appointment = await this.repository.insert({
      roomId,
      customerId: userId,
      landlordId: room.landlordId,
      scheduledAt,
      note,
      phone,
    }, options);

    return appointment;
  }

  async listMyAppointments({ userId, role }) {
    const where = role === "landlord" ? { landlordId: userId } : { customerId: userId };

    return this.repository.getList({
      where,
      include: [
        { model: Room, as: "room", attributes: ["id", "title", "address", "price"] },
        { model: User, as: "customer", attributes: ["id", "fullName", "phone"] },
      ],
      order: [["scheduledAt", "DESC"]],
    });
  }

  async updateAppointmentStatus({ appointmentId, landlordId, status, rejectReason }, options = {}) {
    const appointment = await this.repository.getById(appointmentId, options);

    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    if (appointment.landlordId !== landlordId) {
      throw new ApiError(403, "Forbidden");
    }

    if (!["approved", "rejected", "cancelled"].includes(status)) {
      throw new ApiError(400, "Invalid status");
    }

    if (appointment.status === "approved" && status === "rejected") {
      throw new ApiError(400, "Không thể từ chối lịch hẹn đã được duyệt.");
    }

    if (appointment.status === "rejected" && status === "approved") {
      throw new ApiError(400, "Không thể duyệt lịch hẹn đã bị từ chối.");
    }

    if (appointment.status === status) {
      return { message: "Status is already up to date", appointment };
    }

    if (status === "rejected" && !rejectReason) {
      throw new ApiError(400, "Vui lòng cung cấp lý do từ chối");
    }

    const updatePayload = { status };
    if (status === "rejected") {
      updatePayload.rejectReason = rejectReason;
    }

    await this.repository.updateById(appointmentId, updatePayload, options);

    const updatedAppointment = await this.repository.getById(appointmentId, options);

    return { message: "Appointment updated", appointment: updatedAppointment };
  }

  async cancelAppointment({ appointmentId, customerId }, options = {}) {
    const appointment = await this.repository.getById(appointmentId, options);

    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    if (Number(appointment.customerId) !== Number(customerId)) {
      throw new ApiError(403, "Forbidden");
    }

    if (appointment.status === "cancelled") {
      throw new ApiError(400, "Appointment already cancelled");
    }

    if (appointment.status === "rejected") {
      throw new ApiError(400, "Không thể hủy lịch hẹn đã bị từ chối.");
    }

    if (appointment.status === "approved") {
      throw new ApiError(400, "Không thể hủy lịch hẹn khi chủ trọ đã xác nhận.");
    }

    await this.repository.updateById(
      appointmentId,
      {
        status: "cancelled",
      },
      options
    );

    const updatedAppointment = await this.repository.getById(appointmentId, options);

    return { message: "Appointment cancelled", appointment: updatedAppointment };
  }
}

module.exports = new AppointmentService(appointmentRepository, roomRepository);
