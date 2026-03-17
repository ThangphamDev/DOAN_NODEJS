import Modal from "@/components/common/Modal";

const CreateUserModal = ({
  open,
  formValues,
  isSubmitting,
  onChange,
  onClose,
  onSubmit,
}) => {
  return (
    <Modal
      description="Nhập thông tin tài khoản để tạo người dùng mới trong hệ thống."
      maxWidthClass="max-w-2xl"
      onClose={onClose}
      open={open}
      title="Tạo người dùng mới"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Họ và tên
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              onChange={(event) => onChange("fullName", event.target.value)}
              required
              type="text"
              value={formValues.fullName}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Email
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              onChange={(event) => onChange("email", event.target.value)}
              required
              type="email"
              value={formValues.email}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Mật khẩu
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              minLength="6"
              onChange={(event) => onChange("password", event.target.value)}
              required
              type="password"
              value={formValues.password}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Vai trò
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              onChange={(event) => onChange("role", event.target.value)}
              value={formValues.role}
            >
              <option value="customer">Khách thuê</option>
              <option value="landlord">Chủ trọ</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Số điện thoại
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              onChange={(event) => onChange("phone", event.target.value)}
              type="text"
              value={formValues.phone}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Khu vực
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              onChange={(event) => onChange("area", event.target.value)}
              type="text"
              value={formValues.area}
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            Hủy
          </button>
          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Đang tạo..." : "Tạo người dùng"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUserModal;
