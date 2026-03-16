import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

const getRedirectByRole = (role) => {
  if (role === "admin") return "/admin";
  if (role === "landlord") return "/landlord";
  return "/";
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    if (!email.trim() || !password.trim()) {
      return "Vui lòng nhập đầy đủ email và mật khẩu";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Email không đúng định dạng";
    }

    if (password.length < 6) {
      return "Mật khẩu phải từ 6 ký tự trở lên";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const loggedInUser = await login(email.trim(), password);
      navigate(getRedirectByRole(loggedInUser?.role), { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Đăng nhập thất bại, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <header className="auth-header">
          <div className="auth-eyebrow">TroTot Secure Access</div>
          <h1 className="auth-title">Đăng nhập tài khoản</h1>
          <p className="auth-subtitle">Tiếp tục để tìm phòng, quản lý lịch hẹn và trò chuyện với chủ trọ.</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            <span>Email</span>
            <input
              className="auth-input"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="auth-label">
            <span>Mật khẩu</span>
            <input
              className="auth-input"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button className="auth-button" type="submit" disabled={submitting}>
            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          {error && <p className="auth-error">{error}</p>}
        </form>

        <p className="auth-switch">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </section>
  );
};

export default LoginPage;
