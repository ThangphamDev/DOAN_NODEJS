import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import adminService from "@/services/AdminService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const AdminDashboardPage = () => {
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeRoomsCount, setActiveRoomsCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [roomsRes, usersRes, activeRoomsRes] = await Promise.all([
          adminService.getReportedRooms(),
          adminService.getUsers(),
          adminService.getActiveRoomsCount(),
        ]);

        if (!isMounted) return;

        setRooms(getApiData(roomsRes, []));
        setUsers(getApiData(usersRes, []));
        setActiveRoomsCount(Number(getApiData(activeRoomsRes, { count: 0 })?.count || 0));
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setError(getApiMessage(err, "Không tải được dữ liệu quản trị"));
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalReports = rooms.reduce((sum, item) => sum + Number(item.reportedCount || 0), 0);
    const verificationQueue = users.filter((item) => item.role === "landlord" && item.isActive).length;

    return {
      activeListings: activeRoomsCount,
      totalUsers: users.length,
      totalReports,
      verificationQueue,
    };
  }, [activeRoomsCount, rooms, users]);

  const previewRooms = useMemo(() => rooms.slice(0, 3), [rooms]);
  const previewUsers = useMemo(() => users.slice(0, 3), [users]);

  const getInitials = (value) =>
    (value || "AD")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  return (
    <>
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black tracking-tight">Tổng quan nền tảng</h2>
        <p className="text-slate-500">Trạng thái hệ sinh thái cho thuê được cập nhật theo dữ liệu hiện tại.</p>
      </div>

      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase text-slate-500">Tin đang hoạt động</p>
          <div className="mt-2 flex items-end justify-between">
            <span className="text-2xl font-bold">{stats.activeListings}</span>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
              <span className="material-symbols-outlined text-sm">trending_up</span> Live
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase text-slate-500">Tổng người dùng</p>
          <div className="mt-2 flex items-end justify-between">
            <span className="text-2xl font-bold">{stats.totalUsers}</span>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
              <span className="material-symbols-outlined text-sm">trending_up</span> +5%
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase text-slate-500">Lượt báo cáo</p>
          <div className="mt-2 flex items-end justify-between">
            <span className="text-2xl font-bold">{stats.totalReports}</span>
            <span className="flex items-center gap-1 text-xs font-medium text-rose-500">
              <span className="material-symbols-outlined text-sm">priority_high</span> Cao
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase text-slate-500">Hàng chờ xác minh</p>
          <div className="mt-2 flex items-end justify-between">
            <span className="text-2xl font-bold">{stats.verificationQueue}</span>
            <span className="text-xs font-medium text-primary">Đang chờ</span>
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Tin đăng bị báo cáo</h3>
            <p className="text-sm text-slate-500">Các tin cần được xử lý do vi phạm tiêu chuẩn cộng đồng</p>
          </div>
          <NavLink className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-200" to="/admin/rooms">
            Xem toàn bộ báo cáo
          </NavLink>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Mã tin</th>
                <th className="px-6 py-4">Tiêu đề</th>
                <th className="px-6 py-4">Lý do</th>
                <th className="px-6 py-4">Địa chỉ</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {previewRooms.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-slate-500" colSpan="5">Chưa có tin vi phạm nào.</td>
                </tr>
              ) : (
                previewRooms.map((room) => (
                  <tr className="transition-colors hover:bg-slate-50" key={room.id}>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{room.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const imgUrl = room.images?.[0]?.imageUrl || "";
                          const apiBase = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
                          const src = imgUrl ? (/^https?:\/\//i.test(imgUrl) ? imgUrl : `${apiBase}${imgUrl.startsWith("/") ? imgUrl : `/${imgUrl}`}`) : "";
                          return src ? (
                            <img className="h-10 w-10 flex-shrink-0 rounded object-cover" src={src} alt={room.title} />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-500">
                              {getInitials(room.title)}
                            </div>
                          );
                        })()}
                        <span className="font-medium">{room.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                        Bị báo cáo {room.reportedCount || 0} lần
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{room.address || "Chưa cập nhật"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <NavLink className="p-2 text-slate-400 transition-colors hover:text-primary" to="/admin/rooms">
                          <span className="material-symbols-outlined text-xl">visibility</span>
                        </NavLink>
                        <NavLink className="p-2 text-slate-400 transition-colors hover:text-rose-500" to="/admin/rooms">
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </NavLink>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h3 className="text-xl font-bold">Người dùng gần đây</h3>
          <p className="text-sm text-slate-500">Theo dõi hoạt động và quyền truy cập của thành viên hệ thống</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {previewUsers.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-slate-500" colSpan="5">Chưa có tài khoản nào.</td>
                </tr>
              ) : (
                previewUsers.map((member) => (
                  <tr className="transition-colors hover:bg-slate-50" key={member.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                          {getInitials(member.fullName || member.email)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.fullName || "Người dùng"}</p>
                          <p className="text-xs text-slate-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${member.isActive ? "text-emerald-600" : "text-rose-600"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${member.isActive ? "bg-emerald-600" : "bg-rose-600"}`}></span>
                        {member.isActive ? "Hoạt động" : "Đã khóa"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm capitalize">{member.role}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{member.email}</td>
                    <td className="px-6 py-4 text-right">
                      <NavLink className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50" to="/admin/users">
                        Quản lý
                      </NavLink>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default AdminDashboardPage;
