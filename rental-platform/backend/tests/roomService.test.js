const roomService = require("@/services/roomService");

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

  test("listRooms returns paginated shape", async () => {
    roomService.repository.getListWithCount.mockResolvedValue({ rows: [], count: 0 });

    const result = await roomService.listRooms({ page: 1, limit: 10 });

    expect(result).toEqual({ total: 0, page: 1, limit: 10, data: [] });
  });

  test("reportRoom returns 404 when room not found", async () => {
    roomService.repository.getById.mockResolvedValue(null);

    const result = await roomService.reportRoom(99);

    expect(result.status).toBe(404);
  });
});
