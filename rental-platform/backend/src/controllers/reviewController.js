const reviewService = require("@/services/reviewService");
const { authenticate } = require("@/middleware/auth");
const authorize = require("@/middleware/authorize");
const { sendSuccess } = require("@/utils/response");
const { runInTransaction } = require("@/utils/transaction");

class ReviewController {
	constructor(service) {
		this.service = service;
		this.createReview = this.createReview.bind(this);
		this.getRoomReviews = this.getRoomReviews.bind(this);
	}

	async createReview(req, res, next) {
		try {
			const result = await runInTransaction((tx) =>
				this.service.createReview(
					{
						userId: req.user.id,
						roomId: Number(req.params.roomId),
						rating: req.body.rating,
						content: req.body.content,
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

	async getRoomReviews(req, res, next) {
		try {
			const reviews = await this.service.getRoomReviews(Number(req.params.roomId));
			return sendSuccess(res, { data: reviews });
		} catch (error) {
			return next(error);
		}
	}

	registerRoutes(app, prefix = "/api") {
		app.get(`${prefix}/reviews/room/:roomId`, this.getRoomReviews);
		app.post(
			`${prefix}/reviews/room/:roomId`,
			authenticate,
			authorize("customer"),
			this.createReview
		);
	}
}

module.exports = new ReviewController(reviewService);
