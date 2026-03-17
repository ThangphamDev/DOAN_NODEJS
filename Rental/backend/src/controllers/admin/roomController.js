const roomService = require("@/services/admin/roomService");
const { authenticate } = require("@/middleware/auth");
const authorize = require("@/middleware/authorize");
const { sendSuccess } = require("@/utils/response");
const { runInTransaction } = require("@/utils/transaction");

class AdminRoomController {
  constructor(service) {
    this.service = service;
    this.getReportedRooms = this.getReportedRooms.bind(this);
    this.getReportedRoomDetail = this.getReportedRoomDetail.bind(this);
    this.getReportedContent = this.getReportedContent.bind(this);
    this.updateReportStatus = this.updateReportStatus.bind(this);
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

  async getReportedRoomDetail(req, res, next) {
    try {
      const data = await this.service.getReportedRoomDetail(req.params.id);
      return sendSuccess(res, { data });
    } catch (error) {
      return next(error);
    }
  }

  async getReportedContent(req, res, next) {
    try {
      const data = await this.service.getReportedContent({ status: req.query.status });
      return sendSuccess(res, { data });
    } catch (error) {
      return next(error);
    }
  }

  async updateReportStatus(req, res, next) {
    try {
      const data = await runInTransaction((tx) =>
        this.service.updateReportStatus(req.params.reportId, req.body.status, { transaction: tx })
      );
      return sendSuccess(res, { data });
    } catch (error) {
      return next(error);
    }
  }

  registerRoutes(app, prefix = "/api") {
    app.get(`${prefix}/admin/rooms/reported`, authenticate, authorize("admin"), this.getReportedRooms);
    app.get(`${prefix}/admin/rooms/reported/:id`, authenticate, authorize("admin"), this.getReportedRoomDetail);
    app.get(`${prefix}/admin/reports`, authenticate, authorize("admin"), this.getReportedContent);
    app.patch(`${prefix}/admin/reports/:reportId/status`, authenticate, authorize("admin"), this.updateReportStatus);
    app.delete(`${prefix}/admin/rooms/:id`, authenticate, authorize("admin"), this.deleteViolationRoom);
  }
}

module.exports = new AdminRoomController(roomService);
