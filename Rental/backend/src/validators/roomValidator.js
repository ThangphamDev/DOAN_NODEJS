const validateCreateRoom = (req) => {
  const { title, price, area, address } = req.body || {};

  if (!title || !price || !area || !address) {
    return { error: { message: "Vui lòng điền đầy đủ tiêu đề, giá, khu vực và địa chỉ" } };
  }

  if (String(title).trim().length < 5) {
    return { error: { message: "Tiêu đề phải có ít nhất 5 ký tự" } };
  }

  const numPrice = Number(price);
  if (isNaN(numPrice) || numPrice <= 0) {
    return { error: { message: "Giá phải là số dương" } };
  }

  if (numPrice > 999999999) {
    return { error: { message: "Giá không hợp lệ" } };
  }

  if (String(address).trim().length < 5) {
    return { error: { message: "Địa chỉ phải có ít nhất 5 ký tự" } };
  }

  return { error: null };
};

const validateUpdateRoom = (req) => {
  const { title, price, address } = req.body || {};

  if (title !== undefined && String(title).trim().length < 5) {
    return { error: { message: "Tiêu đề phải có ít nhất 5 ký tự" } };
  }

  if (price !== undefined) {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return { error: { message: "Giá phải là số dương" } };
    }

    if (numPrice > 999999999) {
      return { error: { message: "Giá không hợp lệ" } };
    }
  }

  if (address !== undefined && String(address).trim().length < 5) {
    return { error: { message: "Địa chỉ phải có ít nhất 5 ký tự" } };
  }

  return { error: null };
};

const validateReportRoom = (req) => {
  const { reason } = req.body || {};

  if (!reason || String(reason).trim().length < 5) {
    return { error: { message: "Vui lòng nhập lý do báo cáo (ít nhất 5 ký tự)" } };
  }

  return { error: null };
};

module.exports = {
  validateCreateRoom,
  validateUpdateRoom,
  validateReportRoom,
};
