import { useEffect, useMemo, useState } from "react";
import ConfirmActionModal from "@/components/admin/ConfirmActionModal";
import CreateUserModal from "@/components/admin/CreateUserModal";
import UserDetailModal from "@/components/admin/UserDetailModal";
import adminService from "@/services/AdminService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const initialFormState = {
  fullName: "",
  email: "",
  password: "",
  role: "customer",
  phone: "",
  area: "",
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

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailError, setDetailError] = useState("");
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(initialFormState);
  const [isCreating, setIsCreating] = useState(false);
  const [userPendingStatusChange, setUserPendingStatusChange] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadUsers = async () => {
    try {
      const response = await adminService.getUsers();
      const nextUsers = getApiData(response, []);
      setUsers(nextUsers);
      setError("");

      if (selectedUserId && !nextUsers.some((user) => String(user.id) === String(selectedUserId))) {
        setSelectedUserId(null);
        setSelectedUser(null);
      }
    } catch (err) {
      setError(getApiMessage(err, "Không tải được danh sách tài khoản"));
      setSuccessMessage("");
    }
  };

  const loadUserDetail = async (userId) => {
    try {
      setSelectedUserId(userId);
      setIsDetailLoading(true);
      setDetailError("");
      const response = await adminService.getUserDetail(userId);
      setSelectedUser(getApiData(response, null));
    } catch (err) {
      setSelectedUser(null);
      setDetailError(getApiMessage(err, "Không tải được chi tiết người dùng"));
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const metrics = useMemo(() => {
    const customers = users.filter((item) => item.role === "customer").length;
    const landlords = users.filter((item) => item.role === "landlord").length;
    const blocked = users.filter((item) => !item.isActive).length;

    return { customers, landlords, blocked };
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (activeFilter === "all") {
      return users;
    }

    if (activeFilter === "blocked") {
      return users.filter((user) => !user.isActive);
    }

    return users.filter((user) => user.role === activeFilter);
  }, [activeFilter, users]);

  const toggleUserStatus = async (user) => {
    try {
      setIsUpdatingStatus(true);

      if (user.isActive) {
        await adminService.lockUser(user.id);
        setSuccessMessage("Đã chặn tài khoản.");
      } else {
        await adminService.unlockUser(user.id);
        setSuccessMessage("Đã mở chặn tài khoản.");
      }

      setError("");
      setUserPendingStatusChange(null);
      await loadUsers();

      if (selectedUserId === user.id) {
        await loadUserDetail(user.id);
      }
    } catch (err) {
      setError(getApiMessage(err, "Không cập nhật được trạng thái tài khoản"));
      setSuccessMessage("");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCreateChange = (field, value) => {
    setCreateForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submitCreateUser = async (event) => {
    event.preventDefault();

    try {
      setIsCreating(true);
      const response = await adminService.createUser(createForm);
      const createdUser = getApiData(response, {}).user;
      setSuccessMessage("Đã tạo người dùng mới.");
      setError("");
      setIsCreateOpen(false);
      setCreateForm(initialFormState);
      await loadUsers();

      if (createdUser?.id) {
        await loadUserDetail(createdUser.id);
      }
    } catch (err) {
      setError(getApiMessage(err, "Không tạo được người dùng"));
      setSuccessMessage("");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">Quản lý người dùng</h1>
          <p className="text-sm text-slate-500">Admin tạo tài khoản, xem chi tiết và chặn hoặc mở chặn người dùng trong hệ thống.</p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          Thêm người dùng
        </button>
      </div>

      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {successMessage && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Tổng khách thuê</p>
          <div className="mt-2 text-3xl font-bold">{metrics.customers}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Tổng chủ trọ</p>
          <div className="mt-2 text-3xl font-bold">{metrics.landlords}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Tài khoản bị chặn</p>
          <div className="mt-2 text-3xl font-bold">{metrics.blocked}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            <button
              className={`rounded-md px-4 py-1.5 text-sm ${activeFilter === "all" ? "bg-white font-semibold shadow-sm" : "font-medium text-slate-500 hover:text-slate-900"}`}
              onClick={() => setActiveFilter("all")}
              type="button"
            >
              Tất cả
            </button>
            <button
              className={`rounded-md px-4 py-1.5 text-sm ${activeFilter === "customer" ? "bg-white font-semibold shadow-sm" : "font-medium text-slate-500 hover:text-slate-900"}`}
              onClick={() => setActiveFilter("customer")}
              type="button"
            >
              Khách thuê
            </button>
            <button
              className={`rounded-md px-4 py-1.5 text-sm ${activeFilter === "landlord" ? "bg-white font-semibold shadow-sm" : "font-medium text-slate-500 hover:text-slate-900"}`}
              onClick={() => setActiveFilter("landlord")}
              type="button"
            >
              Chủ trọ
            </button>
            <button
              className={`rounded-md px-4 py-1.5 text-sm ${activeFilter === "blocked" ? "bg-white font-semibold shadow-sm" : "font-medium text-slate-500 hover:text-slate-900"}`}
              onClick={() => setActiveFilter("blocked")}
              type="button"
            >
              Bị chặn
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Người dùng</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Vai trò</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Liên hệ</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-slate-500" colSpan="5">Chưa có tài khoản nào để hiển thị.</td>
                </tr>
              ) : (
                filteredUsers.map((member) => {
                  const roleConfig = roleMap[member.role] || roleMap.customer;

                  return (
                    <tr className={`transition-colors hover:bg-slate-50 ${member.isActive ? "" : "opacity-80"}`} key={member.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                            {getInitials(member.fullName || member.email)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">{member.fullName || "Người dùng"}</span>
                            <span className="text-xs text-slate-500">ID #{member.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleConfig.className}`}>
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1.5 ${member.isActive ? "text-emerald-600" : "text-red-600"}`}>
                          <div className={`size-2 rounded-full ${member.isActive ? "bg-emerald-500" : "bg-red-500"}`}></div>
                          <span className="text-sm font-medium">{member.isActive ? "Hoạt động" : "Đã bị chặn"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        <div>{member.email}</div>
                        <div className="text-xs text-slate-400">{member.phone || member.area || "Chưa cập nhật"}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-primary"
                            onClick={() => loadUserDetail(member.id)}
                            title="Xem chi tiết"
                            type="button"
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                          {member.role !== "admin" ? (
                            <button
                              className={`rounded-lg p-1.5 transition-colors ${member.isActive ? "text-slate-400 hover:bg-red-50 hover:text-red-500" : "text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"}`}
                              onClick={() => setUserPendingStatusChange(member)}
                              title={member.isActive ? "Chặn tài khoản" : "Mở chặn tài khoản"}
                              type="button"
                            >
                              <span className="material-symbols-outlined">{member.isActive ? "block" : "lock_open"}</span>
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserDetailModal
        error={detailError}
        isLoading={isDetailLoading}
        onClose={() => {
          setSelectedUserId(null);
          setSelectedUser(null);
          setDetailError("");
        }}
        onToggleStatus={(user) => setUserPendingStatusChange(user)}
        open={Boolean(selectedUserId)}
        user={selectedUser}
      />

      <CreateUserModal
        formValues={createForm}
        isSubmitting={isCreating}
        onChange={handleCreateChange}
        onClose={() => {
          setIsCreateOpen(false);
          setCreateForm(initialFormState);
        }}
        onSubmit={submitCreateUser}
        open={isCreateOpen}
      />

      <ConfirmActionModal
        confirmClassName={userPendingStatusChange?.isActive ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"}
        confirmLabel={userPendingStatusChange?.isActive ? "Chặn tài khoản" : "Mở chặn tài khoản"}
        description={
          userPendingStatusChange
            ? userPendingStatusChange.isActive
              ? `Bạn có chắc muốn chặn tài khoản "${userPendingStatusChange.fullName || userPendingStatusChange.email}"?`
              : `Bạn có chắc muốn mở chặn tài khoản "${userPendingStatusChange.fullName || userPendingStatusChange.email}"?`
            : ""
        }
        isSubmitting={isUpdatingStatus}
        onClose={() => setUserPendingStatusChange(null)}
        onConfirm={() => toggleUserStatus(userPendingStatusChange)}
        open={Boolean(userPendingStatusChange)}
        title={userPendingStatusChange?.isActive ? "Xác nhận chặn tài khoản" : "Xác nhận mở chặn tài khoản"}
      />
    </>
  );
};

export default ManageUsersPage;
