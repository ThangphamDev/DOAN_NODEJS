import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useNotify } from "@/context/NotifyContext.jsx";
import useAuth from "@/hooks/useAuth";
import { getApiMessage } from "@/utils/apiResponse";

const roleLabelMap = {
  customer: "Khách hàng",
  landlord: "Chủ trọ",
  admin: "Admin",
};

const defaultForm = {
  fullName: "",
  email: "",
  phone: "",
  area: "",
};

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const notify = useNotify();
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      area: user?.area || "",
    });
  }, [user]);

  const avatarInitial = (user?.fullName || user?.email || "U").slice(0, 1).toUpperCase();
  const hasChanges = useMemo(
    () =>
      form.fullName !== (user?.fullName || "") ||
      form.email !== (user?.email || "") ||
      form.phone !== (user?.phone || "") ||
      form.area !== (user?.area || ""),
    [form, user?.area, user?.email, user?.fullName, user?.phone]
  );

  const quickLinks = user?.role === "landlord"
    ? [
        { to: "/landlord/rooms", icon: "home_work", label: "Tin đăng của tôi" },
        { to: "/landlord/appointments", icon: "history", label: "Lịch hẹn thuê" },
        { to: "/landlord/messages", icon: "chat", label: "Tin nhắn" },
      ]
    : [
        { to: "/favorites", icon: "favorite", label: "Phòng yêu thích" },
        { to: "/appointments", icon: "history", label: "Lịch hẹn của tôi" },
        { to: "/messages", icon: "chat", label: "Tin nhắn" },
      ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setForm({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      area: user?.area || "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hasChanges) {
      notify.info("Bạn chưa thay đổi thông tin nào.");
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        area: form.area,
      });
      notify.success("Đã cập nhật hồ sơ thành công.");
    } catch (err) {
      notify.error(getApiMessage(err, "Không thể cập nhật hồ sơ"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page-section">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="w-full shrink-0 md:w-72">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 px-2">
              <h3 className="text-lg font-bold text-slate-900">Cài đặt tài khoản</h3>
              <p className="text-xs text-slate-500">Quản lý thông tin cá nhân và lối tắt đến các mục bạn dùng thường xuyên.</p>
            </div>

            <nav className="flex flex-col gap-1">
              <div className="flex items-center gap-3 rounded-lg bg-primary px-3 py-2.5 font-medium text-white">
                <span className="material-symbols-outlined text-xl">person</span>
                <span className="text-sm">Thông tin cá nhân</span>
              </div>

              {quickLinks.map((item) => (
                <Link
                  key={item.to}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary"
                  to={item.to}
                >
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Thông tin cá nhân</h1>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center gap-6 md:flex-row">
                <div className="relative">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-slate-100 bg-primary/10 text-4xl font-black text-primary">
                    {avatarInitial}
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-bold text-slate-900">Hồ sơ hiển thị</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Thông tin này được dùng khi hiển thị ở khu vực khách hàng, lịch hẹn và nhắn tin.
                  </p>

                  <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
                    <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">
                      <span className="material-symbols-outlined text-lg">verified</span>
                      {roleLabelMap[user?.role] || "Thành viên"}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
                      <span className="material-symbols-outlined text-lg">badge</span>
                      ID người dùng: #{user?.id || "..."}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <form className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900">
                <span className="material-symbols-outlined text-primary">edit_note</span>
                Cập nhật thông tin
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">Họ và tên</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    name="fullName"
                    onChange={handleChange}
                    type="text"
                    value={form.fullName}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    name="email"
                    onChange={handleChange}
                    type="email"
                    value={form.email}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    name="phone"
                    onChange={handleChange}
                    placeholder="Ví dụ: 0912345678"
                    type="text"
                    value={form.phone}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">Khu vực</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    name="area"
                    onChange={handleChange}
                    placeholder="Ví dụ: Quận 7"
                    type="text"
                    value={form.area}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                <button
                  className="rounded-lg bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
                  disabled={saving || !hasChanges}
                  onClick={handleReset}
                  type="button"
                >
                  Hoàn tác
                </button>
                <button
                  className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={saving || !hasChanges}
                  type="submit"
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <span className="material-symbols-outlined text-3xl">verified_user</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Trạng thái tài khoản</h3>
                    <p className="text-sm text-slate-500">Tài khoản của bạn đã sẵn sàng để tiếp tục sử dụng các tính năng hiện có của hệ thống.</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Đã xác minh cơ bản
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
