const { Room, User } = require("@/entities");
const appointmentRepository = require("@/repositories/appointmentRepository");
const roomRepository = require("@/repositories/roomRepository");
const ApiError = require("@/utils/ApiError");

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
    const appointment = await this.repository.getById(appointmentId);

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

    const updatedAppointment = await this.repository.getById(appointmentId);

    return { message: "Appointment updated", appointment: updatedAppointment };
  }
}

module.exports = new AppointmentService(appointmentRepository, roomRepository);
