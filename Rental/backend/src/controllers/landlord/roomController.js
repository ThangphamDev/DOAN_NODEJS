const roomService = require("@/services/landlord/roomService");
const { authenticate } = require("@/middleware/auth");
const authorize = require("@/middleware/authorize");
const upload = require("@/utils/upload");
const validate = require("@/middleware/validate");
const { validateCreateRoom, validateUpdateRoom } = require("@/validators/roomValidator");
const { sendSuccess } = require("@/utils/response");
const { runInTransaction } = require("@/utils/transaction");

class LandlordRoomController {
  constructor(service) {
    this.service = service;
    this.listMyRooms = this.listMyRooms.bind(this);
    this.createRoom = this.createRoom.bind(this);
    this.updateRoom = this.updateRoom.bind(this);
    this.removeRoom = this.removeRoom.bind(this);
  }

  async listMyRooms(req, res, next) {
    try {
      const data = await this.service.listMyRooms({
        userId: req.user.id,
        status: req.query.status,
      });
      return sendSuccess(res, { data });
    } catch (error) {
      return next(error);
    }
  }

  async createRoom(req, res, next) {
    try {
      const data = await runInTransaction((tx) =>
        this.service.createRoom(
          {
            userId: req.user.id,
            body: req.body,
            files: req.files,
          },
          { transaction: tx }
        )
      );
      return sendSuccess(res, { status: 201, data });
    } catch (error) {
      return next(error);
    }
  }

  async updateRoom(req, res, next) {
    try {
      const data = await runInTransaction((tx) =>
        this.service.updateRoom(
          {
            roomId: req.params.id,
            userId: req.user.id,
            body: req.body,
            files: req.files,
          },
          { transaction: tx }
        )
      );
      return sendSuccess(res, { data });
    } catch (error) {
      return next(error);
    }
  }

  async removeRoom(req, res, next) {
    try {
      const data = await runInTransaction((tx) =>
        this.service.removeRoom(
          {
            roomId: req.params.id,
            userId: req.user.id,
            role: req.user.role,
          },
          { transaction: tx }
        )
      );
      return sendSuccess(res, { data });
    } catch (error) {
      return next(error);
    }
  }

  registerRoutes(app, prefix = "/api") {
    app.get(
      `${prefix}/landlord/rooms/me`,
      authenticate,
      authorize("landlord"),
      this.listMyRooms
    );
    app.post(
      `${prefix}/rooms`,
      authenticate,
      authorize("landlord", "admin"),
      upload.array("images", 10),
      validate(validateCreateRoom),
      this.createRoom
    );
    app.patch(
      `${prefix}/rooms/:id`,
      authenticate,
      authorize("landlord", "admin"),
      upload.array("images", 10),
      validate(validateUpdateRoom),
      this.updateRoom
    );
    app.delete(`${prefix}/landlord/rooms/:id`, authenticate, authorize("landlord"), this.removeRoom);
  }
}

module.exports = new LandlordRoomController(roomService);
