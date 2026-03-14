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
    jest.clearAllMocks();
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
      const result = await adminRoomService.deleteViolationRoom(1);
      expect(result.message).toBe("Room removed");
      expect(adminRoomService.repository.updateById).toHaveBeenCalledWith(
        1, { status: "deleted" }, expect.any(Object)
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
