const roomService = require("@/services/roomService");
const ApiError = require("@/utils/ApiError");

const mockRoom = {
  id: 1, title: "Room A", price: 500, area: "HCM", address: "123",
  status: "active", landlordId: 7,
};

describe("RoomService", () => {
  beforeEach(() => {
    roomService.repository = {
      getListWithCount: jest.fn(),
      getById: jest.fn(),
      insert: jest.fn(),
      insertImages: jest.fn(),
      updateById: jest.fn(),
      incrementById: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // ─── listRooms ─────────────────────────────────────────────────────────
  describe("listRooms", () => {
    test("PASS – returns paginated shape with defaults", async () => {
      roomService.repository.getListWithCount.mockResolvedValue({ rows: [], count: 0 });
      const result = await roomService.listRooms({ page: 1, limit: 10 });
      expect(result).toEqual({ total: 0, page: 1, limit: 10, data: [] });
    });

    test("PASS – applies price and area filters", async () => {
      roomService.repository.getListWithCount.mockResolvedValue({ rows: [], count: 0 });
      await roomService.listRooms({ minPrice: 200, maxPrice: 800, area: "HCM", page: 2, limit: 5 });
      const callArg = roomService.repository.getListWithCount.mock.calls[0][0];
      expect(callArg.where.price).toBeDefined();
      expect(callArg.offset).toBe(5); // (page 2 - 1) * limit 5
    });
  });

  // ─── reportRoom ────────────────────────────────────────────────────────
  describe("reportRoom", () => {
    test("FAIL – throws 404 when room not found", async () => {
      roomService.repository.getById.mockResolvedValue(null);
      await expect(roomService.reportRoom(99)).rejects.toMatchObject({ statusCode: 404 });
      expect(roomService.repository.incrementById).not.toHaveBeenCalled();
    });

    test("FAIL – throws 404 when room is deleted", async () => {
      roomService.repository.getById.mockResolvedValue({ ...mockRoom, status: "deleted" });
      await expect(roomService.reportRoom(1)).rejects.toMatchObject({ statusCode: 404 });
    });

    test("ROLLBACK – throws when DB increment fails, increment was attempted", async () => {
      roomService.repository.getById.mockResolvedValue(mockRoom);
      roomService.repository.incrementById.mockRejectedValue(new Error("DB error"));
      await expect(roomService.reportRoom(1)).rejects.toThrow("DB error");
      expect(roomService.repository.incrementById).toHaveBeenCalledTimes(1);
    });

    test("PASS – calls incrementById with correct args", async () => {
      roomService.repository.getById.mockResolvedValue(mockRoom);
      roomService.repository.incrementById.mockResolvedValue([1]);
      const result = await roomService.reportRoom(1);
      expect(result.message).toBe("Room reported");
      expect(roomService.repository.incrementById).toHaveBeenCalledWith(1, "reportedCount", 1, expect.any(Object));
    });
  });

  // ─── createRoom ────────────────────────────────────────────────────────
  describe("createRoom", () => {
    test("FAIL – throws 400 when required fields missing", async () => {
      await expect(
        roomService.createRoom({ userId: 7, body: { title: "A" }, files: [] })
      ).rejects.toMatchObject({ statusCode: 400 });
      expect(roomService.repository.insert).not.toHaveBeenCalled();
    });

    test("PASS – creates room without images", async () => {
      roomService.repository.insert.mockResolvedValue({ ...mockRoom, id: 1 });
      const result = await roomService.createRoom({
        userId: 7,
        body: { title: "Room A", price: 500, area: "HCM", address: "123" },
        files: [],
      });
      expect(result.roomId).toBe(1);
      expect(roomService.repository.insertImages).not.toHaveBeenCalled();
    });

    test("PASS – creates room and inserts images when files provided", async () => {
      roomService.repository.insert.mockResolvedValue({ ...mockRoom, id: 1 });
      roomService.repository.insertImages.mockResolvedValue([]);
      await roomService.createRoom({
        userId: 7,
        body: { title: "Room A", price: 500, area: "HCM", address: "123" },
        files: [{ filename: "img1.jpg" }, { filename: "img2.jpg" }],
      });
      expect(roomService.repository.insertImages).toHaveBeenCalledWith(
        [
          { roomId: 1, imageUrl: "/uploads/img1.jpg" },
          { roomId: 1, imageUrl: "/uploads/img2.jpg" },
        ],
        expect.any(Object)
      );
    });

    test("ROLLBACK – throws when insertImages fails after insert succeeds", async () => {
      // Simulates: room row inserted → insertImages throws → runInTransaction rollbacks room row
      roomService.repository.insert.mockResolvedValue({ ...mockRoom, id: 1 });
      roomService.repository.insertImages.mockRejectedValue(new Error("Image DB error"));

      await expect(
        roomService.createRoom({
          userId: 7,
          body: { title: "Room A", price: 500, area: "HCM", address: "123" },
          files: [{ filename: "img1.jpg" }],
        })
      ).rejects.toThrow("Image DB error");

      // Both were attempted — transaction wrapper at controller level rolls back both
      expect(roomService.repository.insert).toHaveBeenCalledTimes(1);
      expect(roomService.repository.insertImages).toHaveBeenCalledTimes(1);
    });
  });

  // ─── updateRoom ────────────────────────────────────────────────────────
  describe("updateRoom", () => {
    test("FAIL – throws 404 when room not found", async () => {
      roomService.repository.getById.mockResolvedValue(null);
      await expect(
        roomService.updateRoom({ roomId: 99, userId: 7, body: {} })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    test("FAIL – throws 403 when user is not owner", async () => {
      roomService.repository.getById.mockResolvedValue(mockRoom); // landlordId = 7
      await expect(
        roomService.updateRoom({ roomId: 1, userId: 99, body: {} })
      ).rejects.toMatchObject({ statusCode: 403 });
      expect(roomService.repository.updateById).not.toHaveBeenCalled();
    });

    test("ROLLBACK – throws when DB updateById fails", async () => {
      roomService.repository.getById.mockResolvedValue(mockRoom);
      roomService.repository.updateById.mockRejectedValue(new Error("DB error"));
      await expect(
        roomService.updateRoom({ roomId: 1, userId: 7, body: { title: "New" } })
      ).rejects.toThrow("DB error");
      expect(roomService.repository.updateById).toHaveBeenCalledTimes(1);
    });

    test("PASS – updates room and returns updated data", async () => {
      const updated = { ...mockRoom, title: "New Title" };
      roomService.repository.getById
        .mockResolvedValueOnce(mockRoom)
        .mockResolvedValueOnce(updated);
      roomService.repository.updateById.mockResolvedValue([1]);

      const result = await roomService.updateRoom({
        roomId: 1, userId: 7, body: { title: "New Title" },
      });
      expect(result.room.title).toBe("New Title");
    });
  });

  // ─── removeRoom ────────────────────────────────────────────────────────
  describe("removeRoom", () => {
    test("FAIL – throws 404 when room not found", async () => {
      roomService.repository.getById.mockResolvedValue(null);
      await expect(
        roomService.removeRoom({ roomId: 99, userId: 7, role: "landlord" })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    test("FAIL – throws 403 when user is not owner and not admin", async () => {
      roomService.repository.getById.mockResolvedValue(mockRoom);
      await expect(
        roomService.removeRoom({ roomId: 1, userId: 99, role: "landlord" })
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    test("PASS – admin can delete any room", async () => {
      roomService.repository.getById.mockResolvedValue(mockRoom);
      roomService.repository.updateById.mockResolvedValue([1]);
      const result = await roomService.removeRoom({ roomId: 1, userId: 99, role: "admin" });
      expect(result.message).toBe("Room deleted");
      expect(roomService.repository.updateById).toHaveBeenCalledWith(1, { status: "deleted" }, expect.any(Object));
    });

    test("PASS – owner landlord can delete own room", async () => {
      roomService.repository.getById.mockResolvedValue(mockRoom);
      roomService.repository.updateById.mockResolvedValue([1]);
      const result = await roomService.removeRoom({ roomId: 1, userId: 7, role: "landlord" });
      expect(result.message).toBe("Room deleted");
    });
  });
});
