import { Link } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

const roleLabelMap = {
  customer: "Khách hàng",
  landlord: "Chủ trọ",
  admin: "Admin",
};

const ProfilePage = () => {
  const { user } = useAuth();
  const avatarInitial = (user?.fullName || user?.email || "U").slice(0, 1).toUpperCase();

  return (
    <section className="page-section">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="w-full shrink-0 md:w-72">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 px-2">
              <h3 className="text-lg font-bold text-slate-900">Cài đặt tài khoản</h3>
              <p className="text-xs text-slate-500">Quản lý thông tin cá nhân và các mục liên quan của bạn.</p>
            </div>

            <nav className="flex flex-col gap-1">
              <div className="flex items-center gap-3 rounded-lg bg-primary px-3 py-2.5 font-medium text-white">
                <span className="material-symbols-outlined text-xl">person</span>
                <span className="text-sm">Thông tin cá nhân</span>
              </div>

              <Link className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary" to="/favorites">
                <span className="material-symbols-outlined text-xl">favorite</span>
                <span className="text-sm">Phòng yêu thích</span>
              </Link>

              <Link className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary" to="/appointments">
                <span className="material-symbols-outlined text-xl">history</span>
                <span className="text-sm">Lịch hẹn của tôi</span>
              </Link>

              <Link className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary" to="/messages">
                <span className="material-symbols-outlined text-xl">chat</span>
                <span className="text-sm">Tin nhắn</span>
              </Link>
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
                  <h3 className="text-lg font-bold text-slate-900">Ảnh đại diện</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Thông tin hồ sơ của bạn đang được hiển thị ở giao diện khách hàng và khu vực trò chuyện.
                  </p>

                  <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
                    <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">
                      <span className="material-symbols-outlined text-lg">verified</span>
                      {roleLabelMap[user?.role] || "Thành viên"}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
                      <span className="material-symbols-outlined text-lg">mail</span>
                      {user?.email || "Chưa cập nhật email"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900">
                <span className="material-symbols-outlined text-primary">edit_note</span>
                Thông tin chi tiết
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">Họ và tên</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    readOnly
                    type="text"
                    value={user?.fullName || "Chưa cập nhật"}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    readOnly
                    type="email"
                    value={user?.email || "Chưa cập nhật"}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    readOnly
                    type="text"
                    value={user?.phone || "Chưa cập nhật"}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">Khu vực</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    readOnly
                    type="text"
                    value={user?.area || "Chưa cập nhật"}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <span className="material-symbols-outlined text-3xl">verified_user</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Trạng thái tài khoản</h3>
                    <p className="text-sm text-slate-500">Tài khoản của bạn đã hoàn tất các thông tin cơ bản để sử dụng hệ thống.</p>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-1 md:items-end">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Đã xác minh cơ bản
                  </div>
                  <p className="text-sm font-mono tracking-tight text-slate-500">ID người dùng: #{user?.id || "..."}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pb-6">
              <Link className="rounded-lg bg-slate-100 px-8 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200" to="/favorites">
                Xem phòng đã lưu
              </Link>
              <Link className="rounded-lg bg-primary px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-95" to="/appointments">
                Xem lịch hẹn
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
