const { Op } = require("sequelize");
const { RoomImage, User, Review } = require("@/entities");
const { toRoomListModel } = require("@/models");
const roomRepository = require("@/repositories/roomRepository");

class RoomService {
  constructor(repository) {
    this.repository = repository;
  }

  async listRooms({ minPrice, maxPrice, area, page = 1, limit = 10 }) {
    const where = { status: "active" };

    if (area) {
      where.area = { [Op.like]: `%${area}%` };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price[Op.gte] = Number(minPrice);
      }
      if (maxPrice) {
        where.price[Op.lte] = Number(maxPrice);
      }
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await this.repository.getListWithCount({
      where,
      include: [{ model: RoomImage, as: "images" }],
      order: [["createdAt", "DESC"]],
      offset,
      limit: Number(limit),
    });

    return {
      total: count,
      page: Number(page),
      limit: Number(limit),
      data: rows.map(toRoomListModel),
    };
  }

  async getRoomDetail(id) {
    const room = await this.repository.getById(id, {
      include: [
        { model: RoomImage, as: "images" },
        { model: User, as: "landlord", attributes: ["id", "fullName", "phone"] },
        {
          model: Review,
          as: "reviews",
          include: [{ model: User, as: "reviewer", attributes: ["id", "fullName"] }],
        },
      ],
    });

    if (!room || room.status === "deleted") {
      return { status: 404, data: { message: "Room not found" } };
    }

    return { status: 200, data: room };
  }

  async reportRoom(id, options = {}) {
    const room = await this.repository.getById(id);

    if (!room || room.status === "deleted") {
      return { status: 404, data: { message: "Room not found" } };
    }

    await this.repository.incrementById(id, "reportedCount", 1, options);

    return { status: 200, data: { message: "Room reported" } };
  }

  async createRoom({ userId, body, files }, options = {}) {
    const { title, description, price, area, address } = body;

    if (!title || !price || !area || !address) {
      return { status: 400, data: { message: "Missing required fields" } };
    }

    const room = await this.repository.insert(
      {
        landlordId: userId,
        title,
        description,
        price,
        area,
        address,
      },
      options
    );

    if (files?.length) {
      const images = files.map((file) => ({
        roomId: room.id,
        imageUrl: `/uploads/${file.filename}`,
      }));
      await this.repository.insertImages(images, options);
    }

    return { status: 201, data: { message: "Room created", roomId: room.id } };
  }

  async updateRoom({ roomId, userId, body }, options = {}) {
    const room = await this.repository.getById(roomId);

    if (!room || room.status === "deleted") {
      return { status: 404, data: { message: "Room not found" } };
    }

    if (room.landlordId !== userId) {
      return { status: 403, data: { message: "Forbidden" } };
    }

    const { title, description, price, area, address, status } = body;
    await this.repository.updateById(roomId, { title, description, price, area, address, status }, options);

    const updatedRoom = await this.repository.getById(roomId);

    return { status: 200, data: { message: "Room updated", room: updatedRoom } };
  }

  async removeRoom({ roomId, userId, role }, options = {}) {
    const room = await this.repository.getById(roomId);

    if (!room || room.status === "deleted") {
      return { status: 404, data: { message: "Room not found" } };
    }

    if (room.landlordId !== userId && role !== "admin") {
      return { status: 403, data: { message: "Forbidden" } };
    }

    await this.repository.updateById(roomId, { status: "deleted" }, options);

    return { status: 200, data: { message: "Room deleted" } };
  }
}

module.exports = new RoomService(roomRepository);
