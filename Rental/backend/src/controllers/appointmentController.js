const appointmentService = require("@/services/appointmentService");
const { authenticate } = require("@/middleware/auth");
const authorize = require("@/middleware/authorize");
const { sendSuccess } = require("@/utils/response");
const { runInTransaction } = require("@/utils/transaction");

class AppointmentController {
	constructor(service) {
		this.service = service;
		this.createAppointment = this.createAppointment.bind(this);
		this.listMyAppointments = this.listMyAppointments.bind(this);
	}

	async createAppointment(req, res, next) {
		try {
			const data = await runInTransaction((tx) =>
				this.service.createAppointment(
					{
						userId: req.user.id,
						roomId: Number(req.params.roomId),
						scheduledAt: req.body.scheduledAt,
						note: req.body.note,
						phone: req.body.phone,
					},
					{ transaction: tx }
				)
			);
			return sendSuccess(res, { status: 201, data });
		} catch (error) {
			return next(error);
		}
	}

	async listMyAppointments(req, res, next) {
		try {
			const data = await this.service.listMyAppointments({
				userId: req.user.id,
				role: req.user.role,
			});
			return sendSuccess(res, { data });
		} catch (error) {
			return next(error);
		}
	}

	registerRoutes(app, prefix = "/api") {
		app.post(
			`${prefix}/appointments/room/:roomId`,
			authenticate,
			authorize("customer"),
			this.createAppointment
		);
		app.get(
			`${prefix}/appointments/me`,
			authenticate,
			authorize("customer", "landlord"),
			this.listMyAppointments
		);
	}
}

module.exports = new AppointmentController(appointmentService);
