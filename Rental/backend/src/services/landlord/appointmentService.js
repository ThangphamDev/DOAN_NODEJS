const appointmentService = require("@/services/appointmentService");

class LandlordAppointmentService {
  constructor(service) {
    this.service = service;
  }

  updateAppointmentStatus({ appointmentId, landlordId, status, rejectReason }, options = {}) {
    return this.service.updateAppointmentStatus({
      appointmentId,
      landlordId,
      status,
      rejectReason,
    }, options);
  }
}

module.exports = new LandlordAppointmentService(appointmentService);
