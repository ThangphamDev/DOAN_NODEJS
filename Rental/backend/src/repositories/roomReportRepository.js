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
}

module.exports = new RoomReportRepository(RoomReport);
