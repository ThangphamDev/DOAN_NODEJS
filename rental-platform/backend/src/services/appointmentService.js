const { Room, User } = require("@/entities");
const appointmentRepository = require("@/repositories/appointmentRepository");
const roomRepository = require("@/repositories/roomRepository");

class AppointmentService {
  constructor(repository, roomRepo) {
    this.repository = repository;
    this.roomRepository = roomRepo;
  }

  async createAppointment({ userId, roomId, scheduledAt, note }) {
    if (!scheduledAt) {
      return { status: 400, data: { message: "scheduledAt is required" } };
    }

    const room = await this.roomRepository.getById(roomId);
    if (!room || room.status !== "active") {
      return { status: 404, data: { message: "Room not found" } };
    }

    const appointment = await this.repository.insert({
      roomId,
      customerId: userId,
      landlordId: room.landlordId,
      scheduledAt,
      note,
    });

    return { status: 201, data: appointment };
  }

  async listMyAppointments({ userId, role }) {
    const where = role === "landlord" ? { landlordId: userId } : { customerId: userId };

    const appointments = await this.repository.getList({
      where,
      include: [
        { model: Room, as: "room", attributes: ["id", "title", "address", "price"] },
        { model: User, as: "customer", attributes: ["id", "fullName", "phone"] },
      ],
      order: [["scheduledAt", "DESC"]],
    });

    return appointments;
  }

  async updateAppointmentStatus({ appointmentId, landlordId, status }) {
    const appointment = await this.repository.getById(appointmentId);

    if (!appointment) {
      return { status: 404, data: { message: "Appointment not found" } };
    }

    if (appointment.landlordId !== landlordId) {
      return { status: 403, data: { message: "Forbidden" } };
    }

    if (!["approved", "rejected", "cancelled"].includes(status)) {
      return { status: 400, data: { message: "Invalid status" } };
    }

    await this.repository.updateById(appointmentId, { status });

    const updatedAppointment = await this.repository.getById(appointmentId);

    return { status: 200, data: { message: "Appointment updated", appointment: updatedAppointment } };
  }
}

module.exports = new AppointmentService(appointmentRepository, roomRepository);
