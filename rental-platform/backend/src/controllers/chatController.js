const chatService = require("@/services/chatService");
const { authenticate } = require("@/middleware/auth");
const authorize = require("@/middleware/authorize");
const { sendSuccess } = require("@/utils/response");
const { runInTransaction } = require("@/utils/transaction");

class ChatController {
	constructor(service) {
		this.service = service;
		this.sendMessage = this.sendMessage.bind(this);
		this.getConversation = this.getConversation.bind(this);
	}

	async sendMessage(req, res, next) {
		try {
			const receiverId = req.body.receiverId;
			const result = await runInTransaction((tx) =>
				this.service.sendMessage(
					{
						senderId: req.user.id,
						receiverId,
						roomId: req.body.roomId,
						content: req.body.content,
					},
					{ transaction: tx }
				)
			);

			if (result.status !== 201) {
				return sendSuccess(res, {
					status: result.status,
					message: result.data?.message || "Success",
					data: result.data,
				});
			}

			const message = result.data;
			const io = req.app.get("io");

			io.to(`user:${receiverId}`).emit("chat:new", message);
			io.to(`user:${req.user.id}`).emit("chat:new", message);

			return sendSuccess(res, {
				status: result.status,
				message: result.data?.message || "Success",
				data: result.data,
			});
		} catch (error) {
			return next(error);
		}
	}

	async getConversation(req, res, next) {
		try {
			const messages = await this.service.getConversation({
				userId: req.user.id,
				peerId: Number(req.params.peerId),
				roomId: req.query.roomId,
			});
			return sendSuccess(res, { data: messages });
		} catch (error) {
			return next(error);
		}
	}

	registerRoutes(app, prefix = "/api") {
		app.post(`${prefix}/chat/send`, authenticate, authorize("customer", "landlord"), this.sendMessage);
		app.get(
			`${prefix}/chat/conversation/:peerId`,
			authenticate,
			authorize("customer", "landlord"),
			this.getConversation
		);
	}
}

module.exports = new ChatController(chatService);
