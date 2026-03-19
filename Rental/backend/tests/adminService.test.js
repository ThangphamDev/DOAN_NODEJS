const adminRoomService = require("@/services/admin/roomService");
const adminUserService = require("@/services/admin/userService");

const mockRoom = { id: 1, status: "active", reportedCount: 5 };
const mockUser = { id: 1, role: "landlord", isActive: true };

// ─── AdminRoomService ─────────────────────────────────────────────────────────
describe("AdminRoomService", () => {
  beforeEach(() => {
    adminRoomService.repository = {
      getList: jest.fn(),
      getById: jest.fn(),
      updateById: jest.fn(),
    };
    adminRoomService.reportRepository = {
      getList: jest.fn(),
      getById: jest.fn(),
      updateById: jest.fn(),
      updateWhere: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("getActiveListingsCount", () => {
    test("PASS – returns count of active listings", async () => {
      adminRoomService.repository.getList.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);

      const result = await adminRoomService.getActiveListingsCount();

      expect(adminRoomService.repository.getList).toHaveBeenCalledWith({
        where: { status: "active" },
        attributes: ["id"],
      });
      expect(result).toEqual({ count: 3 });
    });
  });

  describe("getReportedContent", () => {
    test("PASS – defaults to all statuses when no status is provided", async () => {
      adminRoomService.reportRepository.getList.mockResolvedValue([]);

      await adminRoomService.getReportedContent();

      expect(adminRoomService.reportRepository.getList).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        })
      );
    });
  });

  describe("getReportedRooms", () => {
    test("PASS – excludes deleted reports from room-level violation summary", async () => {
      adminRoomService.reportRepository.getList.mockResolvedValue([
        {
          status: "deleted",
          reason: "Old deleted report",
          createdAt: new Date("2026-03-19T10:00:00Z"),
          room: {
            toJSON() {
              return { id: 1, title: "Room A", address: "123", status: "active" };
            },
          },
        },
        {
          status: "resolved",
          reason: "Handled report",
          createdAt: new Date("2026-03-19T09:00:00Z"),
          room: {
            toJSON() {
              return { id: 1, title: "Room A", address: "123", status: "active" };
            },
          },
        },
      ]);

      const result = await adminRoomService.getReportedRooms();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        reportedCount: 1,
        pendingReportCount: 0,
        resolvedReportCount: 1,
        deletedReportCount: 0,
      });
    });
  });

  describe("deleteViolationRoom", () => {
    test("FAIL – throws 404 when room not found", async () => {
      adminRoomService.repository.getById.mockResolvedValue(null);
      await expect(adminRoomService.deleteViolationRoom(99))
        .rejects.toMatchObject({ statusCode: 404 });
      expect(adminRoomService.repository.updateById).not.toHaveBeenCalled();
    });

    test("FAIL – throws 404 when room already deleted", async () => {
      adminRoomService.repository.getById.mockResolvedValue({ ...mockRoom, status: "deleted" });
      await expect(adminRoomService.deleteViolationRoom(1))
        .rejects.toMatchObject({ statusCode: 404 });
    });

    test("ROLLBACK – throws when DB updateById fails, it was attempted", async () => {
      adminRoomService.repository.getById.mockResolvedValue(mockRoom);
      adminRoomService.repository.updateById.mockRejectedValue(new Error("DB error"));
      await expect(adminRoomService.deleteViolationRoom(1)).rejects.toThrow("DB error");
      expect(adminRoomService.repository.updateById).toHaveBeenCalledTimes(1);
    });

    test("PASS – marks room as deleted", async () => {
      adminRoomService.repository.getById.mockResolvedValue(mockRoom);
      adminRoomService.repository.updateById.mockResolvedValue([1]);
      adminRoomService.reportRepository.updateWhere.mockResolvedValue([1]);
      const result = await adminRoomService.deleteViolationRoom(1);
      expect(result.message).toBe("Room removed");
      expect(adminRoomService.repository.updateById).toHaveBeenCalledWith(
        1, { status: "deleted" }, expect.any(Object)
      );
      expect(adminRoomService.reportRepository.updateWhere).toHaveBeenCalledWith(
        { roomId: 1, status: { [require("sequelize").Op.ne]: "deleted" } },
        { status: "deleted", reviewedAt: expect.any(Date) },
        expect.any(Object)
      );
    });
  });
});

// ─── AdminUserService ─────────────────────────────────────────────────────────
describe("AdminUserService", () => {
  beforeEach(() => {
    adminUserService.repository = {
      getList: jest.fn(),
      getById: jest.fn(),
      updateById: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("lockUser", () => {
    test("FAIL – throws 404 when user not found", async () => {
      adminUserService.repository.getById.mockResolvedValue(null);
      await expect(adminUserService.lockUser(99))
        .rejects.toMatchObject({ statusCode: 404 });
      expect(adminUserService.repository.updateById).not.toHaveBeenCalled();
    });

    test("FAIL – throws 400 when trying to lock an admin", async () => {
      adminUserService.repository.getById.mockResolvedValue({ ...mockUser, role: "admin" });
      await expect(adminUserService.lockUser(1))
        .rejects.toMatchObject({ statusCode: 400 });
      expect(adminUserService.repository.updateById).not.toHaveBeenCalled();
    });

    test("ROLLBACK – throws when DB updateById fails, it was attempted", async () => {
      adminUserService.repository.getById.mockResolvedValue(mockUser);
      adminUserService.repository.updateById.mockRejectedValue(new Error("DB error"));
      await expect(adminUserService.lockUser(1)).rejects.toThrow("DB error");
      expect(adminUserService.repository.updateById).toHaveBeenCalledTimes(1);
    });

    test("PASS – locks user successfully", async () => {
      adminUserService.repository.getById.mockResolvedValue(mockUser);
      adminUserService.repository.updateById.mockResolvedValue([1]);
      const result = await adminUserService.lockUser(1);
      expect(result.message).toBe("User locked");
      expect(adminUserService.repository.updateById).toHaveBeenCalledWith(
        1, { isActive: false }, expect.any(Object)
      );
    });
  });
});
