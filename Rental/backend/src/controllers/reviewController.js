const reviewService = require("@/services/reviewService");
const { authenticate } = require("@/middleware/auth");
const authorize = require("@/middleware/authorize");
const validate = require("@/middleware/validate");
const { validateCreateReview, validateReplyReview } = require("@/validators/reviewValidator");
const { sendSuccess } = require("@/utils/response");
const { runInTransaction } = require("@/utils/transaction");

class ReviewController {
	constructor(service) {
		this.service = service;
		this.createReview = this.createReview.bind(this);
		this.getRoomReviews = this.getRoomReviews.bind(this);
		this.replyToReview = this.replyToReview.bind(this);
	}

	async createReview(req, res, next) {
		try {
			const data = await runInTransaction((tx) =>
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
			return sendSuccess(res, { status: 201, data });
		} catch (error) {
			return next(error);
		}
	}

	async getRoomReviews(req, res, next) {
		try {
			const data = await this.service.getRoomReviews(Number(req.params.roomId));
			return sendSuccess(res, { data });
		} catch (error) {
			return next(error);
		}
	}

	async replyToReview(req, res, next) {
		try {
			const data = await runInTransaction((tx) =>
				this.service.replyToReview(
					{
						reviewId: Number(req.params.reviewId),
						landlordId: req.user.id,
						content: req.body.content,
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
		app.get(`${prefix}/reviews/room/:roomId`, this.getRoomReviews);
		app.post(
			`${prefix}/reviews/room/:roomId`,
			authenticate,
			authorize("customer"),
			validate(validateCreateReview),
			this.createReview
		);
		app.put(
			`${prefix}/reviews/:reviewId/reply`,
			authenticate,
			authorize("landlord"),
			validate(validateReplyReview),
			this.replyToReview
		);
	}
}

module.exports = new ReviewController(reviewService);
