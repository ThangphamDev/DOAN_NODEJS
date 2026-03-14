const appointmentService = require("@/services/landlord/appointmentService");
const { authenticate } = require("@/middleware/auth");
const authorize = require("@/middleware/authorize");
const { sendSuccess } = require("@/utils/response");
const { runInTransaction } = require("@/utils/transaction");

class LandlordAppointmentController {
  constructor(service) {
    this.service = service;
    this.updateAppointmentStatus = this.updateAppointmentStatus.bind(this);
  }

  async updateAppointmentStatus(req, res, next) {
    try {
      const result = await runInTransaction((tx) =>
        this.service.updateAppointmentStatus(
          {
            appointmentId: req.params.id,
            landlordId: req.user.id,
            status: req.body.status,
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
    app.patch(
      `${prefix}/appointments/:id/status`,
      authenticate,
      authorize("landlord", "admin"),
      this.updateAppointmentStatus
    );
  }
}

module.exports = new LandlordAppointmentController(appointmentService);
