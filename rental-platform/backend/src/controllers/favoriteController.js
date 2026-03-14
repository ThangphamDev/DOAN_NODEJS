const favoriteService = require("@/services/favoriteService");
const { authenticate } = require("@/middleware/auth");
const authorize = require("@/middleware/authorize");
const { sendSuccess } = require("@/utils/response");
const { runInTransaction } = require("@/utils/transaction");

class FavoriteController {
	constructor(service) {
		this.service = service;
		this.toggleFavorite = this.toggleFavorite.bind(this);
		this.myFavorites = this.myFavorites.bind(this);
	}

	async toggleFavorite(req, res, next) {
		try {
			const result = await runInTransaction((tx) =>
				this.service.toggleFavorite(
					{
						userId: req.user.id,
						roomId: Number(req.params.roomId),
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

	async myFavorites(req, res, next) {
		try {
			const favorites = await this.service.getMyFavorites(req.user.id);
			return sendSuccess(res, { data: favorites });
		} catch (error) {
			return next(error);
		}
	}

	registerRoutes(app, prefix = "/api") {
		app.post(
			`${prefix}/favorites/:roomId/toggle`,
			authenticate,
			authorize("customer"),
			this.toggleFavorite
		);
		app.get(`${prefix}/favorites/me`, authenticate, authorize("customer"), this.myFavorites);
	}
}

module.exports = new FavoriteController(favoriteService);
