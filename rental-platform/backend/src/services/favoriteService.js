const { Favorite, Room, RoomImage } = require("@/entities");
const favoriteRepository = require("@/repositories/favoriteRepository");
const roomRepository = require("@/repositories/roomRepository");
const ApiError = require("@/utils/ApiError");

class FavoriteService {
  constructor(repository, roomRepo) {
    this.repository = repository;
    this.roomRepository = roomRepo;
  }

  async toggleFavorite({ userId, roomId }, options = {}) {
    const room = await this.roomRepository.getById(roomId);
    if (!room || room.status === "deleted") {
      throw new ApiError(404, "Room not found");
    }

    const existing = await this.repository.getOne({ where: { userId, roomId } });

    if (existing) {
      await this.repository.deleteById(existing.id, options);
      return { added: false, message: "Removed from favorites" };
    }

    await this.repository.insert({ userId, roomId }, options);
    return { added: true, message: "Added to favorites" };
  }

  async getMyFavorites(userId) {
    return this.repository.getList({
      where: { userId },
      include: [
        {
          model: Room,
          as: "room",
          include: [{ model: RoomImage, as: "images" }],
        },
      ],
    });
  }
}

module.exports = new FavoriteService(favoriteRepository, roomRepository);
