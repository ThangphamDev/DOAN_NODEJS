const authService = require("@/services/authService");
const { authenticate } = require("@/middleware/auth");
const { sendSuccess } = require("@/utils/response");
const { runInTransaction } = require("@/utils/transaction");

class AuthController {
	constructor(service) {
		this.service = service;
		this.register = this.register.bind(this);
		this.login = this.login.bind(this);
		this.me = this.me.bind(this);
	}

	async register(req, res, next) {
		try {
			const data = await runInTransaction((tx) => this.service.register(req.body, { transaction: tx }));
			return sendSuccess(res, { status: 201, data });
		} catch (error) {
			return next(error);
		}
	}

	async login(req, res, next) {
		try {
			const data = await this.service.login(req.body);
			return sendSuccess(res, { data });
		} catch (error) {
			return next(error);
		}
	}

	async me(req, res, next) {
		try {
			const data = await this.service.getMe(req.user.id);
			return sendSuccess(res, { data });
		} catch (error) {
			return next(error);
		}
	}

	registerRoutes(app, prefix = "/api") {
		app.post(`${prefix}/auth/register`, this.register);
		app.post(`${prefix}/auth/login`, this.login);
		app.get(`${prefix}/auth/me`, authenticate, this.me);
	}
}

module.exports = new AuthController(authService);
