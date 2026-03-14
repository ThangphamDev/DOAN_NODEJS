const appointmentService = require("@/services/appointmentService");

describe("AppointmentService", () => {
  beforeEach(() => {
    appointmentService.repository = {
      insert: jest.fn(),
      getList: jest.fn(),
      getById: jest.fn(),
      updateById: jest.fn(),
    };
    appointmentService.roomRepository = {
      getById: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("createAppointment returns 400 when scheduledAt missing", async () => {
    const result = await appointmentService.createAppointment({
      userId: 1,
      roomId: 1,
    });

    expect(result.status).toBe(400);
  });

  test("updateAppointmentStatus returns 400 for invalid status", async () => {
    appointmentService.repository.getById.mockResolvedValue({
      id: 1,
      landlordId: 10,
    });

    const result = await appointmentService.updateAppointmentStatus({
      appointmentId: 1,
      landlordId: 10,
      status: "unknown",
    });

    expect(result.status).toBe(400);
  });
});
