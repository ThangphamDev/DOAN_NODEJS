import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

const getRedirectByRole = (role) => {
  if (role === "admin") return "/admin";
  if (role === "landlord") return "/landlord";
  return "/";
};

const RegisterPage = () => {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "customer" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      return "Vui lòng nhập đầy đủ thông tin bắt buộc";
    }

    if (form.fullName.trim().length < 2) {
      return "Họ tên phải từ 2 ký tự trở lên";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      return "Email không đúng định dạng";
    }

    if (form.password.length < 6) {
      return "Mật khẩu phải từ 6 ký tự trở lên";
    }

    if (!["customer", "landlord"].includes(form.role)) {
      return "Vai trò không hợp lệ";
    }

    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const registeredUser = await register({
        ...form,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
      });
      navigate(getRedirectByRole(registeredUser?.role), { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <header className="auth-header">
          <div className="auth-eyebrow">TroTot New Account</div>
          <h1 className="auth-title">Tạo tài khoản mới</h1>
          <p className="auth-subtitle">Đăng ký để bắt đầu tìm phòng hoặc đăng tin cho thuê nhanh chóng.</p>
        </header>

        <form onSubmit={onSubmit} className="auth-form">
          <label className="auth-label">
            <span>Họ và tên</span>
            <input
              className="auth-input"
              name="fullName"
              placeholder="Nguyễn Văn A"
              value={form.fullName}
              onChange={onChange}
            />
          </label>

          <label className="auth-label">
            <span>Email</span>
            <input
              className="auth-input"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={onChange}
            />
          </label>

          <label className="auth-label">
            <span>Mật khẩu</span>
            <input
              className="auth-input"
              name="password"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              value={form.password}
              onChange={onChange}
            />
          </label>

          <label className="auth-label">
            <span>Vai trò</span>
            <select className="auth-select" name="role" value={form.role} onChange={onChange}>
              <option value="customer">Khách hàng</option>
              <option value="landlord">Chủ trọ</option>
            </select>
          </label>

          <button className="auth-button" type="submit" disabled={submitting}>
            {submitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </button>

          {error && <p className="auth-error">{error}</p>}
        </form>

        <p className="auth-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </section>
  );
};

export default RegisterPage;
