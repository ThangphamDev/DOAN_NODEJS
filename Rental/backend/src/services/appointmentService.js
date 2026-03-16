const { Room, User } = require("@/entities");
const appointmentRepository = require("@/repositories/appointmentRepository");
const roomRepository = require("@/repositories/roomRepository");
const ApiError = require("@/utils/ApiError");

class AppointmentService {
  constructor(repository, roomRepo) {
    this.repository = repository;
    this.roomRepository = roomRepo;
  }

  async createAppointment({ userId, roomId, scheduledAt, note }, options = {}) {
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

  async updateAppointmentStatus({ appointmentId, landlordId, status }, options = {}) {
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

    await this.repository.updateById(appointmentId, { status }, options);

    const updatedAppointment = await this.repository.getById(appointmentId);

    return { message: "Appointment updated", appointment: updatedAppointment };
  }
}

module.exports = new AppointmentService(appointmentRepository, roomRepository);
