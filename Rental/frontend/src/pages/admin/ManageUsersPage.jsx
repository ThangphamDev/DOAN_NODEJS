import { useEffect, useMemo, useState } from "react";
import adminService from "@/services/AdminService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await adminService.getUsers();
        setUsers(getApiData(response, []));
        setError("");
      } catch (err) {
        setError(getApiMessage(err, "Không tải được danh sách tài khoản"));
      }
    };

    loadUsers();
  }, []);

  const metrics = useMemo(() => {
    const customers = users.filter((item) => item.role === "customer").length;
    const landlords = users.filter((item) => item.role === "landlord").length;
    const active = users.filter((item) => item.isActive).length;

    return { customers, landlords, pending: users.length - active };
  }, [users]);

  const lockUser = async (userId) => {
    try {
      await adminService.lockUser(userId);
      const response = await adminService.getUsers();
      setUsers(getApiData(response, []));
      setSuccessMessage("Đã cập nhật trạng thái tài khoản.");
      setError("");
    } catch (err) {
      setError(getApiMessage(err, "Không thể khóa tài khoản"));
      setSuccessMessage("");
    }
  };

  const getInitials = (value) =>
    (value || "US")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  return (
    <>
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">Quản lý người dùng</h1>
          <p className="text-sm text-slate-500">Xem xét, xác minh và kiểm soát quyền truy cập của tất cả thành viên.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90" type="button">
          <span className="material-symbols-outlined text-lg">person_add</span>
          Thêm người dùng
        </button>
      </div>

      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {successMessage && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Tổng khách thuê</p>
          <div className="mt-2 flex items-end justify-between">
            <h3 className="text-3xl font-bold">{metrics.customers}</h3>
            <span className="flex items-center gap-1 text-sm font-medium text-emerald-500">
              <span className="material-symbols-outlined text-lg">trending_up</span> +12%
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Chủ trọ hoạt động</p>
          <div className="mt-2 flex items-end justify-between">
            <h3 className="text-3xl font-bold">{metrics.landlords}</h3>
            <span className="flex items-center gap-1 text-sm font-medium text-emerald-500">
              <span className="material-symbols-outlined text-lg">trending_up</span> +5%
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Tài khoản cần xử lý</p>
          <div className="mt-2 flex items-end justify-between">
            <h3 className="text-3xl font-bold">{metrics.pending}</h3>
            <span className="text-sm font-medium text-amber-500">Cần hành động</span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            <button className="rounded-md bg-white px-4 py-1.5 text-sm font-semibold shadow-sm" type="button">Tất cả</button>
            <button className="px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900" type="button">Khách thuê</button>
            <button className="px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900" type="button">Chủ trọ</button>
          </div>
          <div className="flex-1"></div>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50" type="button">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Lọc
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50" type="button">
            <span className="material-symbols-outlined text-lg">download</span>
            Xuất file
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Người dùng</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Vai trò</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Email</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-slate-500" colSpan="5">Chưa có tài khoản nào để hiển thị.</td>
                </tr>
              ) : (
                users.map((member) => (
                  <tr className={`transition-colors hover:bg-slate-50 ${member.isActive ? "" : "opacity-75"}`} key={member.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                          {getInitials(member.fullName || member.email)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{member.fullName || "Người dùng"}</span>
                          <span className="text-xs text-slate-500">{member.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${member.role === "landlord" ? "bg-amber-100 text-amber-700" : member.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                        {member.role === "landlord" ? "Chủ trọ" : member.role === "admin" ? "Admin" : "Khách thuê"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1.5 ${member.isActive ? "text-emerald-600" : "text-red-600"}`}>
                        <div className={`size-2 rounded-full ${member.isActive ? "bg-emerald-500" : "bg-red-500"}`}></div>
                        <span className="text-sm font-medium">{member.isActive ? "Hoạt động" : "Đã khóa"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{member.email}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-slate-400 transition-colors hover:text-primary" title="Xem hồ sơ" type="button">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                        {member.role !== "admin" && member.isActive ? (
                          <button
                            className="p-1.5 text-slate-400 transition-colors hover:text-red-500"
                            onClick={() => lockUser(member.id)}
                            title="Khóa tài khoản"
                            type="button"
                          >
                            <span className="material-symbols-outlined">block</span>
                          </button>
                        ) : (
                          <button className="p-1.5 text-emerald-500 transition-colors hover:text-emerald-600" title="Đã ổn định" type="button">
                            <span className="material-symbols-outlined">check_circle</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ManageUsersPage;
