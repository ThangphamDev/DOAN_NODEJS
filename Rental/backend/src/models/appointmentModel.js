const toAppointmentModel = (appointment) => {
  if (!appointment) return null;

  return {
    id: appointment.id,
    roomId: appointment.roomId,
    customerId: appointment.customerId,
    landlordId: appointment.landlordId,
    scheduledAt: appointment.scheduledAt,
    status: appointment.status,
    note: appointment.note,
    phone: appointment.phone,
    rejectReason: appointment.rejectReason,
    createdAt: appointment.createdAt,
  };
};

module.exports = {
  toAppointmentModel,
};
