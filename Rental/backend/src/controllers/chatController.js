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
		this.getInbox = this.getInbox.bind(this);
		this.blockUser = this.blockUser.bind(this);
		this.unblockUser = this.unblockUser.bind(this);
	}

	async sendMessage(req, res, next) {
		try {
			const receiverId = req.body.receiverId;
			const message = await runInTransaction((tx) =>
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

			const payload = message?.toJSON ? message.toJSON() : message;
			const io = req.app.get("io");
			io.to(`user:${receiverId}`).emit("chat:new", payload);
			io.to(`user:${req.user.id}`).emit("chat:new", payload);

			return sendSuccess(res, { status: 201, data: message });
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

	async getInbox(req, res, next) {
		try {
			const data = await this.service.getInbox({
				userId: req.user.id,
			});
			return sendSuccess(res, { data });
		} catch (error) {
			return next(error);
		}
	}

	async blockUser(req, res, next) {
		try {
			const data = await runInTransaction((tx) =>
				this.service.blockUser(
					{
						blockerId: req.user.id,
						blockedUserId: Number(req.params.userId),
					},
					{ transaction: tx }
				)
			);
			return sendSuccess(res, { data });
		} catch (error) {
			return next(error);
		}
	}

	async unblockUser(req, res, next) {
		try {
			const data = await runInTransaction((tx) =>
				this.service.unblockUser(
					{
						blockerId: req.user.id,
						blockedUserId: Number(req.params.userId),
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
		app.post(`${prefix}/chat/send`, authenticate, authorize("customer", "landlord"), this.sendMessage);
		app.get(`${prefix}/chat/inbox`, authenticate, authorize("customer", "landlord"), this.getInbox);
		app.post(`${prefix}/chat/block/:userId`, authenticate, authorize("customer", "landlord"), this.blockUser);
		app.delete(`${prefix}/chat/block/:userId`, authenticate, authorize("customer", "landlord"), this.unblockUser);
		app.get(
			`${prefix}/chat/conversation/:peerId`,
			authenticate,
			authorize("customer", "landlord"),
			this.getConversation
		);
	}
}

module.exports = new ChatController(chatService);
