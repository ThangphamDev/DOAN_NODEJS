const appointmentService = require("@/services/appointmentService");

class LandlordAppointmentService {
  constructor(service) {
    this.service = service;
  }

  updateAppointmentStatus({ appointmentId, landlordId, status }) {
    return this.service.updateAppointmentStatus({
      appointmentId,
      landlordId,
      status,
    });
  }
}

module.exports = new LandlordAppointmentService(appointmentService);
