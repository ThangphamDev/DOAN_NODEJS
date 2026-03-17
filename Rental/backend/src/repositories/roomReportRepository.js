const { RoomReport } = require("@/entities");

class RoomReportRepository {
  constructor(roomReportEntity) {
    this.roomReportEntity = roomReportEntity;
  }

  insert(payload, options = {}) {
    return this.roomReportEntity.create(payload, options);
  }

  getList(query) {
    return this.roomReportEntity.findAll(query);
  }

  getOne(query) {
    return this.roomReportEntity.findOne(query);
  }

  getById(id, query = {}) {
    return this.roomReportEntity.findByPk(id, query);
  }

  updateById(id, payload, options = {}) {
    return this.roomReportEntity.update(payload, { where: { id }, ...options });
  }

  updateWhere(where, payload, options = {}) {
    return this.roomReportEntity.update(payload, { where, ...options });
  }
}

module.exports = new RoomReportRepository(RoomReport);
