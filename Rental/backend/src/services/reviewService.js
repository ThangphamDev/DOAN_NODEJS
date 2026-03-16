const { User } = require("@/entities");
const reviewRepository = require("@/repositories/reviewRepository");
const roomRepository = require("@/repositories/roomRepository");
const ApiError = require("@/utils/ApiError");

class ReviewService {
  constructor(repository, roomRepo) {
    this.repository = repository;
    this.roomRepository = roomRepo;
  }

  async createReview({ userId, roomId, rating, content }, options = {}) {
    if (!rating) {
      throw new ApiError(400, "Rating is required");
    }

    const room = await this.roomRepository.getById(roomId);
    if (!room || room.status === "deleted") {
      throw new ApiError(404, "Room not found");
    }

    const existing = await this.repository.getOne({ where: { userId, roomId } });
    if (existing) {
      throw new ApiError(409, "You already reviewed this room");
    }

    const review = await this.repository.insert({
      userId,
      roomId,
      rating,
      content,
    }, options);

    return review;
  }

  async getRoomReviews(roomId) {
    return this.repository.getList({
      where: { roomId },
      include: [{ model: User, as: "reviewer", attributes: ["id", "fullName"] }],
      order: [["createdAt", "DESC"]],
    });
  }
}

module.exports = new ReviewService(reviewRepository, roomRepository);
