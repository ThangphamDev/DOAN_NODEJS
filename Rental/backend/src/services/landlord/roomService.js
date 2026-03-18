const roomService = require("@/services/roomService");

class LandlordRoomService {
  constructor(service) {
    this.service = service;
  }

  listMyRooms({ userId, status }) {
    return this.service.listLandlordRooms({ landlordId: userId, status });
  }

  createRoom({ userId, body, files }, options = {}) {
    return this.service.createRoom({ userId, body, files }, options);
  }

  updateRoom({ roomId, userId, body, files }, options = {}) {
    return this.service.updateRoom({ roomId, userId, body, files }, options);
  }

  removeRoom({ roomId, userId, role }, options = {}) {
    return this.service.removeRoom({ roomId, userId, role }, options);
  }
}

module.exports = new LandlordRoomService(roomService);
