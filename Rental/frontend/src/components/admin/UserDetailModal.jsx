import Modal from "@/components/common/Modal";

const formatDateTime = (value) => {
  if (!value) {
    return "Chưa cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

const getInitials = (value) =>
  (value || "US")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const roleMap = {
  customer: {
    label: "Khách thuê",
    className: "bg-blue-100 text-blue-700",
  },
  landlord: {
    label: "Chủ trọ",
    className: "bg-amber-100 text-amber-700",
  },
  admin: {
    label: "Admin",
    className: "bg-purple-100 text-purple-700",
  },
};

const UserDetailModal = ({
  open,
  user,
  error,
  isLoading,
  onClose,
  onToggleStatus,
}) => {
  return (
    <Modal
      description="Xem thông tin tài khoản và cập nhật trạng thái chặn hoặc mở chặn."
      maxWidthClass="max-w-4xl"
      onClose={onClose}
      open={open}
      title="Chi tiết người dùng"
    >
      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
          Đang tải chi tiết người dùng...
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      {!isLoading && !error && !user ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
          Không có dữ liệu người dùng để hiển thị.
        </div>
      ) : null}

      {!isLoading && !error && user ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-slate-200 p-5">
            <div className="flex items-start gap-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                {getInitials(user.fullName || user.email)}
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{user.fullName}</h4>
                <p className="text-sm text-slate-500">{user.email}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${(roleMap[user.role] || roleMap.customer).className}`}>
                    {(roleMap[user.role] || roleMap.customer).label}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {user.isActive ? "Hoạt động" : "Đã bị chặn"}
                  </span>
                </div>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-1 gap-4 text-sm text-slate-600 md:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-900">Số điện thoại</dt>
                <dd>{user.phone || "Chưa cập nhật"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Khu vực</dt>
                <dd>{user.area || "Chưa cập nhật"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Ngày tạo</dt>
                <dd>{formatDateTime(user.createdAt)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Cập nhật gần nhất</dt>
                <dd>{formatDateTime(user.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 p-5">
            <h4 className="text-lg font-bold text-slate-900">Hành động</h4>
            <div className="mt-4 space-y-3">
              {user.role === "admin" ? (
                <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Tài khoản admin không hỗ trợ chặn hoặc mở chặn.
                </div>
              ) : (
                <button
                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition ${user.isActive ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"}`}
                  onClick={() => onToggleStatus(user)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-lg">{user.isActive ? "block" : "lock_open"}</span>
                  {user.isActive ? "Chặn tài khoản" : "Mở chặn tài khoản"}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default UserDetailModal;
