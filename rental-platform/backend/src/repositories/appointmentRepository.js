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

  insert(payload) {
    return this.appointmentEntity.create(payload);
  }

  updateById(id, payload) {
    return this.appointmentEntity.update(payload, { where: { id } });
  }
}

module.exports = new AppointmentRepository(Appointment);
