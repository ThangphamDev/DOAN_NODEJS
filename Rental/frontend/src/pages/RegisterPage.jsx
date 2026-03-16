import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

const RegisterPage = () => {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "customer" });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <section>
      <h1>Đăng ký</h1>
      <form onSubmit={onSubmit} className="form">
        <input name="fullName" placeholder="Họ tên" value={form.fullName} onChange={onChange} />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} />
        <input name="password" type="password" placeholder="Mật khẩu" value={form.password} onChange={onChange} />
        <select name="role" value={form.role} onChange={onChange}>
          <option value="customer">Khách hàng</option>
          <option value="landlord">Chủ trọ</option>
        </select>
        <button type="submit">Tạo tài khoản</button>
        {error && <p className="error">{error}</p>}
      </form>
    </section>
  );
};

export default RegisterPage;
