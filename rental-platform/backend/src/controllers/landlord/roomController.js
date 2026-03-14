const roomService = require("@/services/landlord/roomService");
const { authenticate } = require("@/middleware/auth");
const authorize = require("@/middleware/authorize");
const upload = require("@/utils/upload");
const { sendSuccess } = require("@/utils/response");
const { runInTransaction } = require("@/utils/transaction");

class LandlordRoomController {
  constructor(service) {
    this.service = service;
    this.createRoom = this.createRoom.bind(this);
    this.updateRoom = this.updateRoom.bind(this);
    this.removeRoom = this.removeRoom.bind(this);
  }

  async createRoom(req, res, next) {
    try {
      const result = await runInTransaction((tx) =>
        this.service.createRoom(
          {
            userId: req.user.id,
            body: req.body,
            files: req.files,
          },
          { transaction: tx }
        )
      );
      return sendSuccess(res, {
        status: result.status,
        message: result.data?.message || "Success",
        data: result.data,
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateRoom(req, res, next) {
    try {
      const result = await runInTransaction((tx) =>
        this.service.updateRoom(
          {
            roomId: req.params.id,
            userId: req.user.id,
            body: req.body,
          },
          { transaction: tx }
        )
      );
      return sendSuccess(res, {
        status: result.status,
        message: result.data?.message || "Success",
        data: result.data,
      });
    } catch (error) {
      return next(error);
    }
  }

  async removeRoom(req, res, next) {
    try {
      const result = await runInTransaction((tx) =>
        this.service.removeRoom(
          {
            roomId: req.params.id,
            userId: req.user.id,
            role: req.user.role,
          },
          { transaction: tx }
        )
      );
      return sendSuccess(res, {
        status: result.status,
        message: result.data?.message || "Success",
        data: result.data,
      });
    } catch (error) {
      return next(error);
    }
  }

  registerRoutes(app, prefix = "/api") {
    app.post(
      `${prefix}/rooms`,
      authenticate,
      authorize("landlord", "admin"),
      upload.array("images", 10),
      this.createRoom
    );
    app.patch(`${prefix}/rooms/:id`, authenticate, authorize("landlord", "admin"), this.updateRoom);
    app.delete(`${prefix}/rooms/:id`, authenticate, authorize("landlord", "admin"), this.removeRoom);
  }
}

module.exports = new LandlordRoomController(roomService);
