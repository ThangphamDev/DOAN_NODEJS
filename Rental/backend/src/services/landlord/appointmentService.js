const appointmentService = require("@/services/appointmentService");

class LandlordAppointmentService {
  constructor(service) {
    this.service = service;
  }

  updateAppointmentStatus({ appointmentId, landlordId, status }, options = {}) {
    return this.service.updateAppointmentStatus({
      appointmentId,
      landlordId,
      status,
    }, options);
  }
}

module.exports = new LandlordAppointmentService(appointmentService);
