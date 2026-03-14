const { User } = require("@/entities");
const reviewRepository = require("@/repositories/reviewRepository");
const roomRepository = require("@/repositories/roomRepository");

class ReviewService {
  constructor(repository, roomRepo) {
    this.repository = repository;
    this.roomRepository = roomRepo;
  }

  async createReview({ userId, roomId, rating, content }) {
    if (!rating) {
      return { status: 400, data: { message: "Rating is required" } };
    }

    const room = await this.roomRepository.getById(roomId);
    if (!room || room.status === "deleted") {
      return { status: 404, data: { message: "Room not found" } };
    }

    const existing = await this.repository.getOne({ where: { userId, roomId } });
    if (existing) {
      return { status: 409, data: { message: "You already reviewed this room" } };
    }

    const review = await this.repository.insert({
      userId,
      roomId,
      rating,
      content,
    });

    return { status: 201, data: review };
  }

  async getRoomReviews(roomId) {
    const reviews = await this.repository.getList({
      where: { roomId },
      include: [{ model: User, as: "reviewer", attributes: ["id", "fullName"] }],
      order: [["createdAt", "DESC"]],
    });

    return reviews;
  }
}

module.exports = new ReviewService(reviewRepository, roomRepository);
