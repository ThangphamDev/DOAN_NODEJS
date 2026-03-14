const roomService = require("@/services/admin/roomService");
const { authenticate } = require("@/middleware/auth");
const authorize = require("@/middleware/authorize");
const { sendSuccess } = require("@/utils/response");
const { runInTransaction } = require("@/utils/transaction");

class AdminRoomController {
  constructor(service) {
    this.service = service;
    this.getReportedRooms = this.getReportedRooms.bind(this);
    this.deleteViolationRoom = this.deleteViolationRoom.bind(this);
  }

  async getReportedRooms(req, res, next) {
    try {
      const data = await this.service.getReportedRooms();
      return sendSuccess(res, { data });
    } catch (error) {
      return next(error);
    }
  }

  async deleteViolationRoom(req, res, next) {
    try {
      const data = await runInTransaction((tx) =>
        this.service.deleteViolationRoom(req.params.id, { transaction: tx })
      );
      return sendSuccess(res, { data });
    } catch (error) {
      return next(error);
    }
  }

  registerRoutes(app, prefix = "/api") {
    app.get(`${prefix}/admin/rooms/reported`, authenticate, authorize("admin"), this.getReportedRooms);
    app.delete(`${prefix}/admin/rooms/:id`, authenticate, authorize("admin"), this.deleteViolationRoom);
  }
}

module.exports = new AdminRoomController(roomService);
