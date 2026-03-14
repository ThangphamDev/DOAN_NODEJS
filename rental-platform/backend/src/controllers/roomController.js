const roomService = require("@/services/roomService");
const { authenticate } = require("@/middleware/auth");
const authorize = require("@/middleware/authorize");
const { sendSuccess } = require("@/utils/response");
const { runInTransaction } = require("@/utils/transaction");

class RoomController {
	constructor(service) {
		this.service = service;
		this.listRooms = this.listRooms.bind(this);
		this.getRoomDetail = this.getRoomDetail.bind(this);
		this.reportRoom = this.reportRoom.bind(this);
	}

	async listRooms(req, res, next) {
		try {
			const data = await this.service.listRooms(req.query);
			return sendSuccess(res, { data });
		} catch (error) {
			return next(error);
		}
	}

	async getRoomDetail(req, res, next) {
		try {
			const result = await this.service.getRoomDetail(req.params.id);
			return sendSuccess(res, {
				status: result.status,
				message: result.data?.message || "Success",
				data: result.data,
			});
		} catch (error) {
			return next(error);
		}
	}

	async reportRoom(req, res, next) {
		try {
			const result = await runInTransaction((tx) =>
				this.service.reportRoom(req.params.id, { transaction: tx })
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
		app.get(`${prefix}/rooms`, this.listRooms);
		app.get(`${prefix}/rooms/:id`, this.getRoomDetail);
		app.post(`${prefix}/rooms/:id/report`, authenticate, authorize("customer"), this.reportRoom);
	}
}

module.exports = new RoomController(roomService);
