const { Op } = require("sequelize");
const { RoomImage, User, Review } = require("@/entities");
const { toRoomListModel, parseRoomDetails, normalizeRoomDetails, attachRoomDetails } = require("@/models");
const roomRepository = require("@/repositories/roomRepository");
const roomReportRepository = require("@/repositories/roomReportRepository");
const ApiError = require("@/utils/ApiError");

class RoomService {
  constructor(repository, reportRepository) {
    this.repository = repository;
    this.reportRepository = reportRepository;
  }

  normalizeSearchText(value = "") {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  matchesKeyword(room, keyword) {
    const normalizedKeyword = this.normalizeSearchText(keyword);
    if (!normalizedKeyword) return true;

    const normalizedRoomText = this.normalizeSearchText(
      [
        room?.title,
        room?.description,
        room?.address,
        room?.area,
        room?.details?.location?.label,
        ...(room?.details?.quickFacts || []).map((item) => item?.value),
        ...(room?.details?.amenities || []).map((item) => item?.label),
      ]
        .filter(Boolean)
        .join(" ")
    );

    if (!normalizedRoomText) return false;
    if (normalizedRoomText.includes(normalizedKeyword)) return true;

    const compactKeyword = normalizedKeyword.replace(/\s+/g, "");
    const compactRoomText = normalizedRoomText.replace(/\s+/g, "");
    if (compactKeyword && compactRoomText.includes(compactKeyword)) return true;

    const keywordTokens = normalizedKeyword.split(" ").filter(Boolean);
    return keywordTokens.every((token) => normalizedRoomText.includes(token));
  }

  parseImageManifest(rawManifest) {
    if (rawManifest === undefined || rawManifest === null || rawManifest === "") {
      return undefined;
    }

    try {
      const parsed = typeof rawManifest === "string" ? JSON.parse(rawManifest) : rawManifest;
      if (!Array.isArray(parsed)) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  buildOrderedImages({ roomId, existingImages = [], manifest, files = [] }) {
    if (!manifest) {
      return files.map((file, index) => ({
        roomId: Number(roomId),
        imageUrl: `/uploads/${file.filename}`,
        sortOrder: index,
      }));
    }

    const existingImageMap = new Map(
      (existingImages || []).map((image) => [Number(image.id), image])
    );
    const fileQueue = [...files];

    const orderedImages = manifest.reduce((result, item, index) => {
      if (item?.type === "existing") {
        const existingImage = existingImageMap.get(Number(item.id));
        if (existingImage) {
          result.push({
            roomId: Number(roomId),
            imageUrl: existingImage.imageUrl,
            sortOrder: index,
          });
        }
        return result;
      }

      if (item?.type === "new") {
        const nextFile = fileQueue.shift();
        if (!nextFile) {
          throw new ApiError(400, "Missing uploaded file for image manifest");
        }

        result.push({
          roomId: Number(roomId),
          imageUrl: `/uploads/${nextFile.filename}`,
          sortOrder: index,
        });
      }

      return result;
    }, []);
    return orderedImages;
  }

  async listLandlordRooms({ landlordId, status }) {
    const where = { landlordId };

    if (status) {
      where.status = status;
    }

    const rooms = await this.repository.getList({
      where,
      include: [
        { model: RoomImage, as: "images" },
        {
          model: Review,
          as: "reviews",
          include: [{ model: User, as: "reviewer", attributes: ["id", "fullName"] }],
        },
      ],
      order: [
        ["createdAt", "DESC"],
        [{ model: RoomImage, as: "images" }, "sortOrder", "ASC"],
        [{ model: RoomImage, as: "images" }, "createdAt", "ASC"],
      ],
    });

    return rooms.map((room) => attachRoomDetails(room));
  }

  async listRooms({ minPrice, maxPrice, area, page = 1, limit = 10 }) {
    const where = { status: "active" };

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = Number(minPrice);
      if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }

    const normalizedPage = Number(page) || 1;
    const normalizedLimit = Number(limit) || 10;
    const offset = (normalizedPage - 1) * normalizedLimit;
    const normalizedKeyword = this.normalizeSearchText(area);

    if (normalizedKeyword) {
      const rows = await this.repository.getList({
        where,
        include: [{ model: RoomImage, as: "images" }],
        order: [
          ["createdAt", "DESC"],
          [{ model: RoomImage, as: "images" }, "sortOrder", "ASC"],
          [{ model: RoomImage, as: "images" }, "createdAt", "ASC"],
        ],
      });

      const filteredRows = rows
        .map((room) => attachRoomDetails(room))
        .filter((room) => this.matchesKeyword(room, normalizedKeyword));

      return {
        total: filteredRows.length,
        page: normalizedPage,
        limit: normalizedLimit,
        data: filteredRows.slice(offset, offset + normalizedLimit).map(toRoomListModel),
      };
    }

    const { rows, count } = await this.repository.getListWithCount({
      where,
      include: [{ model: RoomImage, as: "images" }],
      order: [
        ["createdAt", "DESC"],
        [{ model: RoomImage, as: "images" }, "sortOrder", "ASC"],
        [{ model: RoomImage, as: "images" }, "createdAt", "ASC"],
      ],
      offset,
      limit: Number(limit),
    });

    return {
      total: count,
      page: normalizedPage,
      limit: normalizedLimit,
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
      order: [
        [{ model: RoomImage, as: "images" }, "sortOrder", "ASC"],
        [{ model: RoomImage, as: "images" }, "createdAt", "ASC"],
      ],
    });

    if (!room || room.status === "deleted") {
      throw new ApiError(404, "Room not found");
    }

    return attachRoomDetails(room);
  }

  async getReportStatus(id, userId) {
    const room = await this.repository.getById(id);

    if (!room || room.status === "deleted") {
      throw new ApiError(404, "Room not found");
    }

    const existingReport = await this.reportRepository.getOne({
      where: {
        roomId: Number(id),
        reporterId: Number(userId),
      },
    });

    return { reported: Boolean(existingReport) };
  }

  async reportRoom(id, payload = {}, options = {}) {
    const room = await this.repository.getById(id);

    if (!room || room.status === "deleted") {
      throw new ApiError(404, "Room not found");
    }

    const existingReport = await this.reportRepository.getOne({
      where: {
        roomId: room.id,
        reporterId: payload.userId,
      },
    });

    if (existingReport) {
      throw new ApiError(409, "Bạn đã báo cáo tin đăng này rồi");
    }

    await this.reportRepository.insert(
      {
        roomId: room.id,
        reporterId: payload.userId,
        reason: String(payload.reason || "Bao cao vi pham").trim() || "Bao cao vi pham",
        details: payload.details ? String(payload.details).trim() : null,
      },
      options
    );
    await this.repository.incrementById(id, "reportedCount", 1, options);

    return { message: "Room reported" };
  }

  async createRoom({ userId, body, files }, options = {}) {
    const { title, description, price, area, address } = body;

    if (!title || !price || !area || !address) {
      throw new ApiError(400, "Missing required fields");
    }

    const parsedDetails = parseRoomDetails(body.details);
    if (parsedDetails === null) {
      throw new ApiError(400, "Invalid room details payload");
    }

    const details = normalizeRoomDetails(parsedDetails, {
      title,
      description,
      price,
      area,
      address,
    });

    const room = await this.repository.insert(
      {
        landlordId: userId,
        title,
        description,
        price,
        area,
        address,
        status: body.status || "active",
        details,
      },
      options
    );

    const imageManifest = this.parseImageManifest(body.imageManifest);
    if (imageManifest === null) {
      throw new ApiError(400, "Invalid image manifest payload");
    }

    if (files?.length || imageManifest) {
      const images = this.buildOrderedImages({
        roomId: room.id,
        manifest: imageManifest,
        files,
      });
      await this.repository.insertImages(images, options);
    }

    return { message: "Room created", roomId: room.id };
  }

  async updateRoom({ roomId, userId, body, files }, options = {}) {
    const room = await this.repository.getById(roomId, {
      include: [{ model: RoomImage, as: "images" }],
      order: [
        [{ model: RoomImage, as: "images" }, "sortOrder", "ASC"],
        [{ model: RoomImage, as: "images" }, "createdAt", "ASC"],
      ],
    });

    if (!room || room.status === "deleted") {
      throw new ApiError(404, "Room not found");
    }

    if (room.landlordId !== userId) {
      throw new ApiError(403, "Forbidden");
    }

    const parsedDetails = body.details === undefined ? room.details : parseRoomDetails(body.details);
    if (parsedDetails === null) {
      throw new ApiError(400, "Invalid room details payload");
    }
    const imageManifest = this.parseImageManifest(body.imageManifest);
    if (imageManifest === null) {
      throw new ApiError(400, "Invalid image manifest payload");
    }

    const nextPayload = {
      title: body.title ?? room.title,
      description: body.description ?? room.description,
      price: body.price ?? room.price,
      area: body.area ?? room.area,
      address: body.address ?? room.address,
      status: body.status ?? room.status,
    };

    nextPayload.details = normalizeRoomDetails(parsedDetails, {
      ...room.get({ plain: true }),
      ...nextPayload,
    });

    await this.repository.updateById(roomId, nextPayload, options);

    if (imageManifest || files?.length) {
      const images = this.buildOrderedImages({
        roomId,
        existingImages: room.images || [],
        manifest: imageManifest || [],
        files,
      });
      await this.repository.deleteImagesByRoomId(roomId, options);
      if (images.length) {
        await this.repository.insertImages(images, options);
      }
    }

    const updatedRoom = await this.repository.getById(roomId, {
      include: [{ model: RoomImage, as: "images" }],
      order: [
        [{ model: RoomImage, as: "images" }, "sortOrder", "ASC"],
        [{ model: RoomImage, as: "images" }, "createdAt", "ASC"],
      ],
    });
    return { message: "Room updated", room: attachRoomDetails(updatedRoom) };
  }

  async removeRoom({ roomId, userId, role }, options = {}) {
    const room = await this.repository.getById(roomId);

    if (!room || room.status === "deleted") {
      throw new ApiError(404, "Room not found");
    }

    if (room.landlordId !== userId && role !== "admin") {
      throw new ApiError(403, "Forbidden");
    }

    await this.repository.updateById(roomId, { status: "deleted" }, options);

    return { message: "Room deleted" };
  }
}

module.exports = new RoomService(roomRepository, roomReportRepository);
