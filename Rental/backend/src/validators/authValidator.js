const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
const MIN_PASSWORD_LENGTH = 6;

const validateRegister = (req) => {
  const { fullName, email, password, role, phone } = req.body || {};

  if (!fullName || !email || !password) {
    return { error: { message: "Vui lòng điền đầy đủ họ tên, email và mật khẩu" } };
  }

  if (String(fullName).trim().length < 2) {
    return { error: { message: "Họ tên phải có ít nhất 2 ký tự" } };
  }

  if (!EMAIL_REGEX.test(String(email).trim())) {
    return { error: { message: "Email không hợp lệ" } };
  }

  if (String(password).length < MIN_PASSWORD_LENGTH) {
    return { error: { message: `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự` } };
  }

  if (role && !["customer", "landlord"].includes(role)) {
    return { error: { message: "Vai trò không hợp lệ" } };
  }

  if (phone && !PHONE_REGEX.test(String(phone).trim())) {
    return { error: { message: "Số điện thoại không hợp lệ" } };
  }

  return { error: null };
};

const validateLogin = (req) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return { error: { message: "Vui lòng nhập email và mật khẩu" } };
  }

  if (!EMAIL_REGEX.test(String(email).trim())) {
    return { error: { message: "Email không hợp lệ" } };
  }

  return { error: null };
};

const validateUpdateProfile = (req) => {
  const { fullName, email, phone } = req.body || {};

  if (fullName !== undefined && String(fullName).trim().length < 2) {
    return { error: { message: "Họ tên phải có ít nhất 2 ký tự" } };
  }

  if (email !== undefined && !EMAIL_REGEX.test(String(email).trim())) {
    return { error: { message: "Email không hợp lệ" } };
  }

  if (phone && !PHONE_REGEX.test(String(phone).trim())) {
    return { error: { message: "Số điện thoại không hợp lệ" } };
  }

  return { error: null };
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
};
