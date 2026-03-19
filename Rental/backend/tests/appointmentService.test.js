const appointmentService = require("@/services/appointmentService");
const ApiError = require("@/utils/ApiError");

const mockRoom = { id: 1, status: "active", landlordId: 10 };
const mockAppointment = { id: 1, roomId: 1, customerId: 5, landlordId: 10, scheduledAt: "2026-04-01", status: "pending" };

describe("AppointmentService", () => {
  beforeEach(() => {
    appointmentService.repository = {
      insert: jest.fn(),
      getList: jest.fn(),
      getById: jest.fn(),
      updateById: jest.fn(),
    };
    appointmentService.roomRepository = { getById: jest.fn() };
    jest.clearAllMocks();
  });

  // ─── createAppointment ───────────────────────────────────────────────────
  describe("createAppointment", () => {
    test("FAIL – throws 400 when scheduledAt missing", async () => {
      await expect(
        appointmentService.createAppointment({ userId: 5, roomId: 1 })
      ).rejects.toMatchObject({ statusCode: 400 });
      expect(appointmentService.repository.insert).not.toHaveBeenCalled();
    });

    test("FAIL – throws 404 when room not found", async () => {
      appointmentService.roomRepository.getById.mockResolvedValue(null);
      await expect(
        appointmentService.createAppointment({ userId: 5, roomId: 99, scheduledAt: "2026-04-01" })
      ).rejects.toMatchObject({ statusCode: 404 });
      expect(appointmentService.repository.insert).not.toHaveBeenCalled();
    });

    test("FAIL – throws 404 when room not active", async () => {
      appointmentService.roomRepository.getById.mockResolvedValue({ ...mockRoom, status: "deleted" });
      await expect(
        appointmentService.createAppointment({ userId: 5, roomId: 1, scheduledAt: "2026-04-01" })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    test("ROLLBACK – throws when DB insert fails, insert was attempted", async () => {
      appointmentService.roomRepository.getById.mockResolvedValue(mockRoom);
      appointmentService.repository.insert.mockRejectedValue(new Error("DB error"));

      await expect(
        appointmentService.createAppointment({ userId: 5, roomId: 1, scheduledAt: "2026-04-01" })
      ).rejects.toThrow("DB error");
      // insert was called → runInTransaction controller wrapper would rollback
      expect(appointmentService.repository.insert).toHaveBeenCalledTimes(1);
    });

    test("PASS – returns appointment on success", async () => {
      appointmentService.roomRepository.getById.mockResolvedValue(mockRoom);
      appointmentService.repository.insert.mockResolvedValue(mockAppointment);

      const result = await appointmentService.createAppointment({
        userId: 5, roomId: 1, scheduledAt: "2026-04-01", note: "hi",
      });

      expect(result).toMatchObject({ roomId: 1, customerId: 5 });
      expect(appointmentService.repository.insert).toHaveBeenCalledWith(
        expect.objectContaining({ customerId: 5, landlordId: 10 }),
        expect.any(Object)
      );
    });
  });

  // ─── updateAppointmentStatus ─────────────────────────────────────────────
  describe("updateAppointmentStatus", () => {
    test("FAIL – throws 404 when appointment not found", async () => {
      appointmentService.repository.getById.mockResolvedValue(null);
      await expect(
        appointmentService.updateAppointmentStatus({ appointmentId: 99, landlordId: 10, status: "approved" })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    test("FAIL – throws 403 when landlord does not own appointment", async () => {
      appointmentService.repository.getById.mockResolvedValue({ id: 1, landlordId: 10 });
      await expect(
        appointmentService.updateAppointmentStatus({ appointmentId: 1, landlordId: 99, status: "approved" })
      ).rejects.toMatchObject({ statusCode: 403 });
      expect(appointmentService.repository.updateById).not.toHaveBeenCalled();
    });

    test("FAIL – throws 400 for invalid status value", async () => {
      appointmentService.repository.getById.mockResolvedValue({ id: 1, landlordId: 10 });
      await expect(
        appointmentService.updateAppointmentStatus({ appointmentId: 1, landlordId: 10, status: "unknown" })
      ).rejects.toMatchObject({ statusCode: 400 });
      expect(appointmentService.repository.updateById).not.toHaveBeenCalled();
    });

    test("ROLLBACK – throws when DB update fails, updateById was attempted", async () => {
      appointmentService.repository.getById.mockResolvedValue({ id: 1, landlordId: 10 });
      appointmentService.repository.updateById.mockRejectedValue(new Error("DB error"));

      await expect(
        appointmentService.updateAppointmentStatus({ appointmentId: 1, landlordId: 10, status: "approved" })
      ).rejects.toThrow("DB error");
      expect(appointmentService.repository.updateById).toHaveBeenCalledTimes(1);
    });

    test("PASS – updates status and returns data", async () => {
      const updated = { ...mockAppointment, status: "approved" };
      appointmentService.repository.getById
        .mockResolvedValueOnce({ id: 1, landlordId: 10 }) // first call: ownership check
        .mockResolvedValueOnce(updated);                  // second call: fetch updated
      appointmentService.repository.updateById.mockResolvedValue([1]);

      const result = await appointmentService.updateAppointmentStatus({
        appointmentId: 1, landlordId: 10, status: "approved",
      });

      expect(result.appointment.status).toBe("approved");
      expect(appointmentService.repository.updateById).toHaveBeenCalledWith(
        1, { status: "approved" }, expect.any(Object)
      );
    });

    test("PASS – each valid status value is accepted", async () => {
      for (const status of ["approved", "rejected", "cancelled"]) {
        const updated = { ...mockAppointment, status };
        appointmentService.repository.getById
          .mockResolvedValueOnce({ id: 1, landlordId: 10 })
          .mockResolvedValueOnce(updated);
        appointmentService.repository.updateById.mockResolvedValue([1]);

        const result = await appointmentService.updateAppointmentStatus({
          appointmentId: 1, landlordId: 10, status,
          rejectReason: status === "rejected" ? "Không còn lịch trống" : undefined,
        });
        expect(result.appointment.status).toBe(status);
      }
    });
  });

  describe("cancelAppointment", () => {
    test("FAIL – throws 404 when appointment not found", async () => {
      appointmentService.repository.getById.mockResolvedValue(null);
      await expect(
        appointmentService.cancelAppointment({ appointmentId: 99, customerId: 5 })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    test("FAIL – throws 403 when customer does not own appointment", async () => {
      appointmentService.repository.getById.mockResolvedValue({ id: 1, customerId: 7, status: "pending" });
      await expect(
        appointmentService.cancelAppointment({ appointmentId: 1, customerId: 5 })
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    test("FAIL – throws 400 when appointment already cancelled", async () => {
      appointmentService.repository.getById.mockResolvedValue({ id: 1, customerId: 5, status: "cancelled" });
      await expect(
        appointmentService.cancelAppointment({ appointmentId: 1, customerId: 5 })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test("PASS – cancels pending appointment", async () => {
      appointmentService.repository.getById
        .mockResolvedValueOnce({ id: 1, customerId: 5, status: "pending" })
        .mockResolvedValueOnce({ ...mockAppointment, status: "cancelled" });
      appointmentService.repository.updateById.mockResolvedValue([1]);

      const result = await appointmentService.cancelAppointment({ appointmentId: 1, customerId: 5 });

      expect(appointmentService.repository.updateById).toHaveBeenCalledWith(
        1,
        { status: "cancelled" },
        expect.any(Object)
      );
      expect(result.appointment.status).toBe("cancelled");
    });
  });
});
