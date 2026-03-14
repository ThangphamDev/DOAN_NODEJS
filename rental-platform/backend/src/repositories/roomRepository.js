const { Room, RoomImage } = require("@/entities");

class RoomRepository {
  constructor(roomEntity, roomImageEntity) {
    this.roomEntity = roomEntity;
    this.roomImageEntity = roomImageEntity;
  }

  getById(id, query = {}) {
    return this.roomEntity.findByPk(id, query);
  }

  getList(query) {
    return this.roomEntity.findAll(query);
  }

  getListWithCount(query) {
    return this.roomEntity.findAndCountAll(query);
  }

  insert(payload, options = {}) {
    return this.roomEntity.create(payload, options);
  }

  updateById(id, payload, options = {}) {
    return this.roomEntity.update(payload, { where: { id }, ...options });
  }

  incrementById(id, field, by = 1, options = {}) {
    return this.roomEntity.increment(field, { by, where: { id }, ...options });
  }

  insertImages(payload, options = {}) {
    return this.roomImageEntity.bulkCreate(payload, options);
  }
}

module.exports = new RoomRepository(Room, RoomImage);
