const { Favorite, Room, RoomImage } = require("@/entities");
const favoriteRepository = require("@/repositories/favoriteRepository");
const roomRepository = require("@/repositories/roomRepository");

class FavoriteService {
  constructor(repository, roomRepo) {
    this.repository = repository;
    this.roomRepository = roomRepo;
  }

  async toggleFavorite({ userId, roomId }) {
    const room = await this.roomRepository.getById(roomId);
    if (!room || room.status === "deleted") {
      return { status: 404, data: { message: "Room not found" } };
    }

    const existing = await this.repository.getOne({
      where: { userId, roomId },
    });

    if (existing) {
      await this.repository.deleteById(existing.id);
      return { status: 200, data: { message: "Removed from favorites" } };
    }

    await this.repository.insert({ userId, roomId });
    return { status: 201, data: { message: "Added to favorites" } };
  }

  async getMyFavorites(userId) {
    const favorites = await this.repository.getList({
      where: { userId },
      include: [
        {
          model: Room,
          as: "room",
          include: [{ model: RoomImage, as: "images" }],
        },
      ],
    });

    return favorites;
  }
}

module.exports = new FavoriteService(favoriteRepository, roomRepository);
