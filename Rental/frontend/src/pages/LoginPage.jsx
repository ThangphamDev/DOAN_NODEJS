import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

const getRedirectByRole = (role) => {
  if (role === "admin") return "/admin";
  if (role === "landlord") return "/landlord";
  return "/";
};

const LoginPage = ({ adminOnly = false }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const getLoginErrorMessage = (err) => {
    const status = err?.response?.status;
    const message = err?.response?.data?.message;

    if (status === 400) {
      return message || "Vui lòng nhập đầy đủ email và mật khẩu.";
    }

    if (status === 401) {
      return message || "Email hoặc mật khẩu không đúng.";
    }

    if (status === 403) {
      if (message?.toLowerCase().includes("khóa")) {
        return "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.";
      }

      return message || "Bạn không có quyền truy cập vào khu vực này.";
    }

    if (!err?.response) {
      return "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.";
    }

    return message || "Đăng nhập thất bại. Vui lòng thử lại.";
  };

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const loggedInUser = await login(email.trim(), password);

      if (adminOnly && loggedInUser?.role !== "admin") {
        logout();
        setError("Trang đăng nhập này chỉ dành cho admin.");
        return;
      }

      if (!adminOnly && loggedInUser?.role === "admin") {
        logout();
        setError("Admin vui lòng đăng nhập tại cổng quản trị riêng.");
        return;
      }

      navigate(getRedirectByRole(loggedInUser?.role), { replace: true });
    } catch (err) {
      setError(getLoginErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-11rem)] w-full max-w-5xl items-center px-4 py-8">
      <div className="flex min-h-[650px] w-full overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="relative hidden w-1/2 md:block">
          <img
            alt="Không gian sống ấm cúng"
            className="absolute inset-0 h-full w-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUYjPLqcKUGGaRJHQ4DTzvoxEzr35B7_NG9IEVQlgIJqP0nssbeUk8gDGowrwWyJL0bVcDEcINUD9SwjmbFvU7NTe3LoXfHJtJHvV35U5kjODuU8U5oN_MdUJnmasYNW39PZcL4nUvmuqkdE7-bAc5CiDY7xjcEki_PT8E4rJTjSUnoFfKDfsN_o8HbW8OO2fN2AYyMu2kfzQ7kvbUfseumdCKZjutGqLumdREjP4WFmT7D-YuCQkyuBI3UjqwPWB1B4oWPHEnzv_X"
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-primary/85 to-transparent p-12 text-white">
            <div className="mb-4">
              <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-md">
                {adminOnly ? "Cổng quản trị riêng" : "Tìm trọ dễ dàng"}
              </span>
            </div>
            <h1 className="mb-4 text-4xl font-bold">
              {adminOnly ? "Quản trị hệ thống tập trung và minh bạch" : "Tìm kiếm không gian sống lý tưởng của bạn"}
            </h1>
            <p className="text-lg leading-relaxed text-white/80">
              {adminOnly
                ? "Theo dõi người dùng, kiểm duyệt tin đăng và xử lý báo cáo trên một giao diện thống nhất."
                : "Kết nối hàng nghìn chủ trọ và người thuê phòng trên khắp cả nước với nền tảng minh bạch và tiện lợi."}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col justify-center p-8 md:w-1/2 md:p-12">
          <div className="mb-8">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                <span className="material-symbols-outlined">home_work</span>
              </div>
              <span className="text-xl font-bold uppercase tracking-tight text-slate-900">LivinX</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {adminOnly ? "Đăng nhập quản trị" : "Chào mừng bạn trở lại"}
            </h2>
            <p className="mt-2 text-slate-500">
              {adminOnly
                ? "Vui lòng đăng nhập để tiếp tục quản lý nền tảng."
                : "Vui lòng đăng nhập để tiếp tục trải nghiệm tìm phòng và trò chuyện với chủ trọ."}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">mail</span>
                <input
                  className="w-full rounded-lg border-none bg-slate-50 py-3 pl-10 pr-4 text-slate-900 ring-1 ring-slate-200 outline-none transition-all focus:ring-2 focus:ring-primary"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="example@gmail.com"
                  type="email"
                  value={email}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between">
                <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
                {!adminOnly ? (
                  <button className="text-xs font-semibold text-primary hover:underline" type="button">
                    Quên mật khẩu?
                  </button>
                ) : null}
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">lock</span>
                <input
                  className="w-full rounded-lg border-none bg-slate-50 py-3 pl-10 pr-4 text-slate-900 ring-1 ring-slate-200 outline-none transition-all focus:ring-2 focus:ring-primary"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  type="password"
                  value={password}
                />
              </div>
            </div>

            {!adminOnly ? (
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" type="checkbox" />
                Ghi nhớ đăng nhập
              </label>
            ) : null}

            <button
              className="w-full rounded-lg bg-primary px-4 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Đang đăng nhập..." : adminOnly ? "Đăng nhập quản trị" : "Đăng nhập"}
            </button>

            {error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
          </form>

          <p className="mt-10 text-center text-sm text-slate-600">
            {adminOnly ? (
              <>
                Bạn là khách hàng hoặc chủ trọ?{" "}
                <Link className="font-bold text-primary hover:underline" to="/login">
                  Đăng nhập tại đây
                </Link>
              </>
            ) : (
              <>
                Chưa có tài khoản?{" "}
                <Link className="font-bold text-primary hover:underline" to="/register">
                  Đăng ký ngay
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
