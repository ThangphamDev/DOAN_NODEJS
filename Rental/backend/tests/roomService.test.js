const roomService = require("@/services/roomService");

const mockRoom = {
  id: 1,
  title: "Room A",
  price: 500,
  area: "HCM",
  address: "123",
  status: "active",
  landlordId: 7,
  details: { booking: { leaseTerms: ["12 tháng"], defaultLeaseTerm: "12 tháng" } },
  images: [
    { id: 11, roomId: 1, imageUrl: "/uploads/old-1.jpg", sortOrder: 0 },
    { id: 12, roomId: 1, imageUrl: "/uploads/old-2.jpg", sortOrder: 1 },
  ],
  get() {
    return { ...this };
  },
};

describe("RoomService", () => {
  beforeEach(() => {
    roomService.repository = {
      getList: jest.fn(),
      getListWithCount: jest.fn(),
      getById: jest.fn(),
      insert: jest.fn(),
      insertImages: jest.fn(),
      deleteImagesByRoomId: jest.fn(),
      updateById: jest.fn(),
      incrementById: jest.fn(),
    };

    roomService.reportRepository = {
      getOne: jest.fn().mockResolvedValue(null),
      insert: jest.fn().mockResolvedValue({ id: 1 }),
    };

    jest.clearAllMocks();
  });

  describe("listRooms", () => {
    test("returns paginated shape with defaults", async () => {
      roomService.repository.getListWithCount.mockResolvedValue({ rows: [], count: 0 });
      const result = await roomService.listRooms({ page: 1, limit: 10 });
      expect(result).toEqual({ total: 0, page: 1, limit: 10, data: [] });
    });

    test("applies price and area filters", async () => {
      roomService.repository.getList.mockResolvedValue([]);
      await roomService.listRooms({ minPrice: 200, maxPrice: 800, area: "HCM", page: 2, limit: 5 });
      const callArg = roomService.repository.getList.mock.calls[0][0];
      expect(callArg.where.price).toBeDefined();
    });

    test("matches street keyword without accents and with partial text", async () => {
      roomService.repository.getList.mockResolvedValue([
        {
          ...mockRoom,
          title: "Phòng trọ gần RMIT",
          address: "45 Nguyễn Hữu Thọ, Quận 7, TP.HCM",
          details: { quickFacts: [], amenities: [], location: { label: "Đường Nguyễn Hữu Thọ" } },
          get() {
            return { ...this };
          },
        },
        {
          ...mockRoom,
          id: 2,
          title: "Studio trung tâm",
          address: "12 Điện Biên Phủ, Quận 3",
          details: { quickFacts: [], amenities: [], location: { label: "Điện Biên Phủ" } },
          get() {
            return { ...this };
          },
        },
      ]);

      const result = await roomService.listRooms({ area: "nguyen huu", page: 1, limit: 10 });

      expect(result.total).toBe(1);
      expect(result.data[0].address).toContain("Nguyễn Hữu Thọ");
    });
  });

  describe("reportRoom", () => {
    test("throws 404 when room not found", async () => {
      roomService.repository.getById.mockResolvedValue(null);
      await expect(roomService.reportRoom(99)).rejects.toMatchObject({ statusCode: 404 });
      expect(roomService.repository.incrementById).not.toHaveBeenCalled();
    });

    test("throws 404 when room is deleted", async () => {
      roomService.repository.getById.mockResolvedValue({ ...mockRoom, status: "deleted" });
      await expect(roomService.reportRoom(1)).rejects.toMatchObject({ statusCode: 404 });
    });

    test("throws when DB increment fails after report insert", async () => {
      roomService.repository.getById.mockResolvedValue(mockRoom);
      roomService.repository.incrementById.mockRejectedValue(new Error("DB error"));
      await expect(roomService.reportRoom(1, { userId: 10 })).rejects.toThrow("DB error");
      expect(roomService.reportRepository.insert).toHaveBeenCalledTimes(1);
    });

    test("increments report count with correct args", async () => {
      roomService.repository.getById.mockResolvedValue(mockRoom);
      roomService.repository.incrementById.mockResolvedValue([1]);
      const result = await roomService.reportRoom(1, { userId: 10 });
      expect(result.message).toBe("Room reported");
      expect(roomService.repository.incrementById).toHaveBeenCalledWith(1, "reportedCount", 1, expect.any(Object));
    });
  });

  describe("getReportStatus", () => {
    test("throws 404 when room not found", async () => {
      roomService.repository.getById.mockResolvedValue(null);
      await expect(roomService.getReportStatus(99, 10)).rejects.toMatchObject({ statusCode: 404 });
    });

    test("returns false when customer has not reported room", async () => {
      roomService.repository.getById.mockResolvedValue(mockRoom);
      roomService.reportRepository.getOne.mockResolvedValue(null);

      const result = await roomService.getReportStatus(1, 10);

      expect(result).toEqual({ reported: false });
    });

    test("returns true when customer already reported room", async () => {
      roomService.repository.getById.mockResolvedValue(mockRoom);
      roomService.reportRepository.getOne.mockResolvedValue({ id: 5, roomId: 1, reporterId: 10 });

      const result = await roomService.getReportStatus(1, 10);

      expect(result).toEqual({ reported: true });
    });
  });

  describe("createRoom", () => {
    test("throws 400 when required fields missing", async () => {
      await expect(roomService.createRoom({ userId: 7, body: { title: "A" }, files: [] })).rejects.toMatchObject({
        statusCode: 400,
      });
      expect(roomService.repository.insert).not.toHaveBeenCalled();
    });

    test("creates room without images", async () => {
      roomService.repository.insert.mockResolvedValue({ ...mockRoom, id: 1 });
      const result = await roomService.createRoom({
        userId: 7,
        body: { title: "Room A", price: 500, area: "HCM", address: "123" },
        files: [],
      });
      expect(result.roomId).toBe(1);
      expect(roomService.repository.insertImages).not.toHaveBeenCalled();
    });

    test("normalizes dynamic room details from payload", async () => {
      roomService.repository.insert.mockResolvedValue({ ...mockRoom, id: 2 });

      await roomService.createRoom({
        userId: 7,
        body: {
          title: "Room A",
          price: 500,
          area: "HCM",
          address: "123",
          details: JSON.stringify({
            badges: [{ label: "Full nội thất", tone: "success" }],
            quickFacts: [{ icon: "square_foot", label: "Diện tích", value: "30 m²" }],
          }),
        },
        files: [],
      });

      const payload = roomService.repository.insert.mock.calls[0][0];
      expect(payload.details.badges[0]).toEqual({ label: "Full nội thất", tone: "success" });
      expect(payload.details.quickFacts[0].value).toBe("30 m²");
    });

    test("creates room and keeps upload order from image manifest", async () => {
      roomService.repository.insert.mockResolvedValue({ ...mockRoom, id: 1 });
      roomService.repository.insertImages.mockResolvedValue([]);

      await roomService.createRoom({
        userId: 7,
        body: {
          title: "Room A",
          price: 500,
          area: "HCM",
          address: "123",
          imageManifest: JSON.stringify([{ type: "new", clientId: "a" }, { type: "new", clientId: "b" }]),
        },
        files: [{ filename: "img1.jpg" }, { filename: "img2.jpg" }],
      });

      expect(roomService.repository.insertImages).toHaveBeenCalledWith(
        [
          { roomId: 1, imageUrl: "/uploads/img1.jpg", sortOrder: 0 },
          { roomId: 1, imageUrl: "/uploads/img2.jpg", sortOrder: 1 },
        ],
        expect.any(Object)
      );
    });
  });

  describe("updateRoom", () => {
    test("throws 404 when room is not found", async () => {
      roomService.repository.getById.mockResolvedValue(null);
      await expect(roomService.updateRoom({ roomId: 99, userId: 7, body: {} })).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    test("throws 403 when user is not owner", async () => {
      roomService.repository.getById.mockResolvedValue(mockRoom);
      await expect(roomService.updateRoom({ roomId: 1, userId: 99, body: {} })).rejects.toMatchObject({
        statusCode: 403,
      });
      expect(roomService.repository.updateById).not.toHaveBeenCalled();
    });

    test("updates room and returns updated data", async () => {
      const updated = { ...mockRoom, title: "New Title", get() { return { ...this }; } };
      roomService.repository.getById.mockResolvedValueOnce(mockRoom).mockResolvedValueOnce(updated);
      roomService.repository.updateById.mockResolvedValue([1]);

      const result = await roomService.updateRoom({
        roomId: 1,
        userId: 7,
        body: { title: "New Title" },
      });

      expect(result.room.title).toBe("New Title");
    });

    test("rebuilds image order with existing and new images", async () => {
      const updated = {
        ...mockRoom,
        title: "Room A Updated",
        images: [
          { id: 12, roomId: 1, imageUrl: "/uploads/old-2.jpg", sortOrder: 0 },
          { id: 99, roomId: 1, imageUrl: "/uploads/new-1.jpg", sortOrder: 1 },
          { id: 11, roomId: 1, imageUrl: "/uploads/old-1.jpg", sortOrder: 2 },
        ],
        get() {
          return { ...this };
        },
      };

      roomService.repository.getById.mockResolvedValueOnce(mockRoom).mockResolvedValueOnce(updated);
      roomService.repository.updateById.mockResolvedValue([1]);
      roomService.repository.deleteImagesByRoomId.mockResolvedValue(2);
      roomService.repository.insertImages.mockResolvedValue([]);

      await roomService.updateRoom({
        roomId: 1,
        userId: 7,
        body: {
          status: "rented",
          imageManifest: JSON.stringify([
            { type: "existing", id: 12 },
            { type: "new", clientId: "new-a" },
            { type: "existing", id: 11 },
          ]),
        },
        files: [{ filename: "new-1.jpg" }],
      });

      expect(roomService.repository.deleteImagesByRoomId).toHaveBeenCalledWith(1, expect.any(Object));
      expect(roomService.repository.insertImages).toHaveBeenCalledWith(
        [
          { roomId: 1, imageUrl: "/uploads/old-2.jpg", sortOrder: 0 },
          { roomId: 1, imageUrl: "/uploads/new-1.jpg", sortOrder: 1 },
          { roomId: 1, imageUrl: "/uploads/old-1.jpg", sortOrder: 2 },
        ],
        expect.any(Object)
      );
      expect(roomService.repository.updateById).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ status: "rented" }),
        expect.any(Object)
      );
    });
  });

  describe("removeRoom", () => {
    test("throws 404 when room is not found", async () => {
      roomService.repository.getById.mockResolvedValue(null);
      await expect(roomService.removeRoom({ roomId: 99, userId: 7, role: "landlord" })).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    test("throws 403 when user is not owner and not admin", async () => {
      roomService.repository.getById.mockResolvedValue(mockRoom);
      await expect(roomService.removeRoom({ roomId: 1, userId: 99, role: "landlord" })).rejects.toMatchObject({
        statusCode: 403,
      });
    });

    test("allows admin to delete any room", async () => {
      roomService.repository.getById.mockResolvedValue(mockRoom);
      roomService.repository.updateById.mockResolvedValue([1]);

      const result = await roomService.removeRoom({ roomId: 1, userId: 99, role: "admin" });

      expect(result.message).toBe("Room deleted");
      expect(roomService.repository.updateById).toHaveBeenCalledWith(1, { status: "deleted" }, expect.any(Object));
    });

    test("allows owner landlord to delete own room", async () => {
      roomService.repository.getById.mockResolvedValue(mockRoom);
      roomService.repository.updateById.mockResolvedValue([1]);

      const result = await roomService.removeRoom({ roomId: 1, userId: 7, role: "landlord" });

      expect(result.message).toBe("Room deleted");
    });
  });
});
