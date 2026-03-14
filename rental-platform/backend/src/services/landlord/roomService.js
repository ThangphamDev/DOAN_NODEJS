const roomService = require("@/services/roomService");

class LandlordRoomService {
  constructor(service) {
    this.service = service;
  }

  createRoom({ userId, body, files }) {
    return this.service.createRoom({ userId, body, files });
  }

  updateRoom({ roomId, userId, body }) {
    return this.service.updateRoom({ roomId, userId, body });
  }

  removeRoom({ roomId, userId, role }) {
    return this.service.removeRoom({ roomId, userId, role });
  }
}

module.exports = new LandlordRoomService(roomService);
