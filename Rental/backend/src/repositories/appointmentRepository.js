const { Appointment } = require("@/entities");

class AppointmentRepository {
  constructor(appointmentEntity) {
    this.appointmentEntity = appointmentEntity;
  }

  getById(id) {
    return this.appointmentEntity.findByPk(id);
  }

  getList(query) {
    return this.appointmentEntity.findAll(query);
  }

  insert(payload, options = {}) {
    return this.appointmentEntity.create(payload, options);
  }

  updateById(id, payload, options = {}) {
    return this.appointmentEntity.update(payload, { where: { id }, ...options });
  }
}

module.exports = new AppointmentRepository(Appointment);
