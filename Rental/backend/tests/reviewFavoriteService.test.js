const reviewService = require("@/services/reviewService");
const favoriteService = require("@/services/favoriteService");

// ─── ReviewService ────────────────────────────────────────────────────────────
describe("ReviewService", () => {
  const mockRoom = { id: 1, status: "active" };

  beforeEach(() => {
    reviewService.repository = {
      getOne: jest.fn(),
      getList: jest.fn(),
      insert: jest.fn(),
    };
    reviewService.roomRepository = { getById: jest.fn() };
    jest.clearAllMocks();
  });

  describe("createReview", () => {
    test("FAIL – throws 400 when rating missing", async () => {
      await expect(
        reviewService.createReview({ userId: 1, roomId: 1, content: "ok" })
      ).rejects.toMatchObject({ statusCode: 400 });
      expect(reviewService.repository.insert).not.toHaveBeenCalled();
    });

    test("FAIL – throws 404 when room not found", async () => {
      reviewService.roomRepository.getById.mockResolvedValue(null);
      await expect(
        reviewService.createReview({ userId: 1, roomId: 99, rating: 5 })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    test("FAIL – throws 404 when room is deleted", async () => {
      reviewService.roomRepository.getById.mockResolvedValue({ ...mockRoom, status: "deleted" });
      await expect(
        reviewService.createReview({ userId: 1, roomId: 1, rating: 5 })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    test("FAIL – throws 409 when user already reviewed", async () => {
      reviewService.roomRepository.getById.mockResolvedValue(mockRoom);
      reviewService.repository.getOne.mockResolvedValue({ id: 10 });
      await expect(
        reviewService.createReview({ userId: 1, roomId: 1, rating: 5 })
      ).rejects.toMatchObject({ statusCode: 409 });
      expect(reviewService.repository.insert).not.toHaveBeenCalled();
    });

    test("ROLLBACK – throws when DB insert fails, insert was attempted", async () => {
      reviewService.roomRepository.getById.mockResolvedValue(mockRoom);
      reviewService.repository.getOne.mockResolvedValue(null);
      reviewService.repository.insert.mockRejectedValue(new Error("DB error"));
      await expect(
        reviewService.createReview({ userId: 1, roomId: 1, rating: 5 })
      ).rejects.toThrow("DB error");
      expect(reviewService.repository.insert).toHaveBeenCalledTimes(1);
    });

    test("PASS – creates review and returns it", async () => {
      const mock = { id: 1, userId: 1, roomId: 1, rating: 5, content: "great" };
      reviewService.roomRepository.getById.mockResolvedValue(mockRoom);
      reviewService.repository.getOne.mockResolvedValue(null);
      reviewService.repository.insert.mockResolvedValue(mock);
      const result = await reviewService.createReview({ userId: 1, roomId: 1, rating: 5, content: "great" });
      expect(result.rating).toBe(5);
    });
  });
});

// ─── FavoriteService ──────────────────────────────────────────────────────────
describe("FavoriteService", () => {
  const mockRoom = { id: 1, status: "active" };

  beforeEach(() => {
    favoriteService.repository = {
      getOne: jest.fn(),
      getList: jest.fn(),
      insert: jest.fn(),
      deleteById: jest.fn(),
    };
    favoriteService.roomRepository = { getById: jest.fn() };
    jest.clearAllMocks();
  });

  describe("toggleFavorite", () => {
    test("FAIL – throws 404 when room not found", async () => {
      favoriteService.roomRepository.getById.mockResolvedValue(null);
      await expect(
        favoriteService.toggleFavorite({ userId: 1, roomId: 99 })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    test("FAIL – throws 404 when room is deleted", async () => {
      favoriteService.roomRepository.getById.mockResolvedValue({ ...mockRoom, status: "deleted" });
      await expect(
        favoriteService.toggleFavorite({ userId: 1, roomId: 1 })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    test("ROLLBACK – throws when deleteById fails, deleteById was attempted", async () => {
      favoriteService.roomRepository.getById.mockResolvedValue(mockRoom);
      favoriteService.repository.getOne.mockResolvedValue({ id: 5 }); // already favorited
      favoriteService.repository.deleteById.mockRejectedValue(new Error("DB error"));
      await expect(
        favoriteService.toggleFavorite({ userId: 1, roomId: 1 })
      ).rejects.toThrow("DB error");
      expect(favoriteService.repository.deleteById).toHaveBeenCalledTimes(1);
    });

    test("ROLLBACK – throws when insert fails, insert was attempted", async () => {
      favoriteService.roomRepository.getById.mockResolvedValue(mockRoom);
      favoriteService.repository.getOne.mockResolvedValue(null); // not yet favorited
      favoriteService.repository.insert.mockRejectedValue(new Error("DB error"));
      await expect(
        favoriteService.toggleFavorite({ userId: 1, roomId: 1 })
      ).rejects.toThrow("DB error");
      expect(favoriteService.repository.insert).toHaveBeenCalledTimes(1);
    });

    test("PASS – removes favorite when already exists", async () => {
      favoriteService.roomRepository.getById.mockResolvedValue(mockRoom);
      favoriteService.repository.getOne.mockResolvedValue({ id: 5 });
      favoriteService.repository.deleteById.mockResolvedValue(1);
      const result = await favoriteService.toggleFavorite({ userId: 1, roomId: 1 });
      expect(result.added).toBe(false);
      expect(result.message).toContain("Removed");
    });

    test("PASS – adds favorite when not exists", async () => {
      favoriteService.roomRepository.getById.mockResolvedValue(mockRoom);
      favoriteService.repository.getOne.mockResolvedValue(null);
      favoriteService.repository.insert.mockResolvedValue({ id: 10 });
      const result = await favoriteService.toggleFavorite({ userId: 1, roomId: 1 });
      expect(result.added).toBe(true);
      expect(result.message).toContain("Added");
    });
  });
});
