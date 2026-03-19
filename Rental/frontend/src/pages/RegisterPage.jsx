import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

const getRedirectByRole = (role) => {
  if (role === "admin") return "/admin";
  if (role === "landlord") return "/landlord";
  return "/";
};

const roleOptions = [
  {
    id: "customer",
    title: "Người tìm phòng",
    icon: "person_search",
    description: "Tìm phòng, lưu yêu thích, đặt lịch xem và nhắn tin trực tiếp với chủ trọ.",
  },
  {
    id: "landlord",
    title: "Chủ trọ",
    icon: "real_estate_agent",
    description: "Đăng tin, quản lý lịch hẹn và phản hồi khách thuê trong một bảng điều khiển riêng.",
  },
];

const RegisterPage = () => {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "customer" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const validate = () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      return "Vui lòng nhập đầy đủ thông tin bắt buộc.";
    }

    if (form.fullName.trim().length < 2) {
      return "Họ tên phải từ 2 ký tự trở lên.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      return "Email không đúng định dạng.";
    }

    if (form.password.length < 6) {
      return "Mật khẩu phải từ 6 ký tự trở lên.";
    }

    if (!["customer", "landlord"].includes(form.role)) {
      return "Vai trò không hợp lệ.";
    }

    return "";
  };

  const onSubmit = async (event) => {
    event.preventDefault();
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
      setError(err?.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-11rem)] w-full max-w-5xl items-center px-4 py-8">
      <div className="flex min-h-[700px] w-full overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="relative hidden w-1/2 md:block">
          <img
            alt="Không gian sống hiện đại"
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/45 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
            <span className="mb-4 w-fit rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur-md">
              Bắt đầu cùng LivinX
            </span>
            <h1 className="mb-4 text-4xl font-bold leading-tight">
              Tạo tài khoản để tìm phòng hoặc bắt đầu đăng tin chuyên nghiệp
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-white/80">
              LivinX giúp khách thuê và chủ trọ kết nối minh bạch, nhanh hơn và an toàn hơn trong cùng một hệ thống.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold">Khách thuê</p>
                <p className="mt-1 text-sm text-white/75">Lưu phòng yêu thích, đặt lịch xem và nhắn tin trực tiếp.</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold">Chủ trọ</p>
                <p className="mt-1 text-sm text-white/75">Quản lý tin đăng, lịch hẹn và phản hồi khách thuê trên dashboard riêng.</p>
              </div>
            </div>
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
            <h2 className="text-2xl font-bold text-slate-900">Tạo tài khoản mới</h2>
            <p className="mt-2 text-slate-500">
              Chọn vai trò phù hợp để bắt đầu tìm phòng hoặc quản lý bài đăng cho thuê của bạn.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {roleOptions.map((option) => {
              const active = form.role === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, role: option.id }))}
                  className={`rounded-2xl border-2 p-4 text-left transition-all ${
                    active ? "border-primary bg-primary/5 shadow-sm shadow-primary/10" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className={`material-symbols-outlined ${active ? "text-primary" : "text-slate-400"}`}>
                      {option.icon}
                    </span>
                    <span className={`text-sm font-bold ${active ? "text-primary" : "text-slate-700"}`}>{option.title}</span>
                  </div>
                  <p className="text-xs leading-5 text-slate-500">{option.description}</p>
                </button>
              );
            })}
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Họ và tên</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">person</span>
                <input
                  className="w-full rounded-lg border-none bg-slate-50 py-3 pl-10 pr-4 text-slate-900 ring-1 ring-slate-200 outline-none transition-all focus:ring-2 focus:ring-primary"
                  name="fullName"
                  onChange={onChange}
                  placeholder="Nguyễn Văn A"
                  value={form.fullName}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">mail</span>
                <input
                  className="w-full rounded-lg border-none bg-slate-50 py-3 pl-10 pr-4 text-slate-900 ring-1 ring-slate-200 outline-none transition-all focus:ring-2 focus:ring-primary"
                  name="email"
                  onChange={onChange}
                  placeholder="name@example.com"
                  type="email"
                  value={form.email}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
                <span className="text-xs text-slate-400">Tối thiểu 6 ký tự</span>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">lock</span>
                <input
                  className="w-full rounded-lg border-none bg-slate-50 py-3 pl-10 pr-4 text-slate-900 ring-1 ring-slate-200 outline-none transition-all focus:ring-2 focus:ring-primary"
                  name="password"
                  onChange={onChange}
                  placeholder="••••••••"
                  type="password"
                  value={form.password}
                />
              </div>
            </div>
            <button
              className="w-full rounded-lg bg-primary px-4 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </button>

            {error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
          </form>

          <p className="mt-10 text-center text-sm text-slate-600">
            Đã có tài khoản?{" "}
            <Link className="font-bold text-primary hover:underline" to="/login">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;
