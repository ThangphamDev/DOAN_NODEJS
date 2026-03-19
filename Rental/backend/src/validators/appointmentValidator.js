const PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

const validateCreateAppointment = (req) => {
  const { scheduledAt, phone } = req.body || {};

  if (!scheduledAt) {
    return { error: { message: "Vui lòng chọn ngày hẹn xem phòng" } };
  }

  const scheduledDate = new Date(scheduledAt);
  if (isNaN(scheduledDate.getTime())) {
    return { error: { message: "Ngày hẹn không hợp lệ" } };
  }

  if (scheduledDate <= new Date()) {
    return { error: { message: "Ngày hẹn phải là ngày trong tương lai" } };
  }

  if (phone && !PHONE_REGEX.test(String(phone).trim())) {
    return { error: { message: "Số điện thoại không hợp lệ" } };
  }

  return { error: null };
};

const validateUpdateAppointmentStatus = (req) => {
  const { status, rejectReason } = req.body || {};

  if (!status) {
    return { error: { message: "Vui lòng chọn trạng thái" } };
  }

  if (!["approved", "rejected", "cancelled"].includes(status)) {
    return { error: { message: "Trạng thái không hợp lệ" } };
  }

  if (status === "rejected" && (!rejectReason || String(rejectReason).trim().length < 3)) {
    return { error: { message: "Vui lòng nhập lý do từ chối (ít nhất 3 ký tự)" } };
  }

  return { error: null };
};

module.exports = {
  validateCreateAppointment,
  validateUpdateAppointmentStatus,
};
