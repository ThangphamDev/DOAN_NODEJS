import { useEffect, useMemo, useState } from "react";
import adminService from "@/services/AdminService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const ManageRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const loadReportedRooms = async () => {
    try {
      const response = await adminService.getReportedRooms();
      setRooms(getApiData(response, []));
      setError("");
    } catch (err) {
      setError(getApiMessage(err, "Không tải được danh sách tin vi phạm"));
      setSuccessMessage("");
    }
  };

  useEffect(() => {
    loadReportedRooms();
  }, []);

  const deleteViolationRoom = async (roomId) => {
    try {
      await adminService.deleteRoom(roomId);
      setSuccessMessage("Đã xóa tin vi phạm.");
      setError("");
      await loadReportedRooms();
    } catch (err) {
      setError(getApiMessage(err, "Không thể xóa tin vi phạm"));
      setSuccessMessage("");
    }
  };

  const metrics = useMemo(() => {
    const totalReports = rooms.reduce((sum, room) => sum + Number(room.reportedCount || 0), 0);
    return {
      pending: rooms.length,
      severe: rooms.filter((room) => Number(room.reportedCount || 0) >= 3).length,
      totalReports,
      impactedAreas: new Set(rooms.map((room) => room.address || `#${room.id}`)).size,
    };
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    return rooms.filter((room) => {
      const matchesTab =
        activeTab === "pending"
          ? true
          : activeTab === "severe"
            ? Number(room.reportedCount || 0) >= 3
            : Number(room.reportedCount || 0) <= 1;

      const haystack = `${room.id} ${room.title || ""} ${room.address || ""}`.toLowerCase();
      const matchesSearch = !normalized || haystack.includes(normalized);
      return matchesTab && matchesSearch;
    });
  }, [rooms, activeTab, searchQuery]);

  const getReportMeta = (room) => {
    const count = Number(room.reportedCount || 0);
    if (count >= 3) {
      return {
        label: "Bị báo cáo nhiều lần",
        className: "bg-red-100 text-red-700",
      };
    }
    if (count === 2) {
      return {
        label: "Cần kiểm tra gấp",
        className: "bg-amber-100 text-amber-700",
      };
    }
    return {
      label: "Mới phát sinh",
      className: "bg-primary/10 text-primary",
    };
  };

  const getInitials = (value) =>
    (value || "RM")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Quản lý tin đăng vi phạm</h2>
          <p className="text-slate-500">Dùng đúng cấu trúc của `reportmanager.html`, giữ dữ liệu thật từ API báo cáo.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50" type="button">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Bộ lọc nâng cao
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary/90" type="button">
            <span className="material-symbols-outlined text-sm">export_notes</span>
            Xuất báo cáo
          </button>
        </div>
      </div>

      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {successMessage && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-3 text-amber-500">
            <span className="material-symbols-outlined">pending_actions</span>
            <span className="text-xs font-bold uppercase tracking-wider">Chờ xử lý</span>
          </div>
          <div className="text-2xl font-bold">{metrics.pending}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-3 text-red-500">
            <span className="material-symbols-outlined">report</span>
            <span className="text-xs font-bold uppercase tracking-wider">Vi phạm nặng</span>
          </div>
          <div className="text-2xl font-bold">{metrics.severe}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-3 text-emerald-500">
            <span className="material-symbols-outlined">flag</span>
            <span className="text-xs font-bold uppercase tracking-wider">Lượt báo cáo</span>
          </div>
          <div className="text-2xl font-bold">{metrics.totalReports}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-3 text-primary">
            <span className="material-symbols-outlined">location_on</span>
            <span className="text-xs font-bold uppercase tracking-wider">Khu vực ảnh hưởng</span>
          </div>
          <div className="text-2xl font-bold">{metrics.impactedAreas}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex border-b border-slate-200 gap-8">
          <button className={`flex items-center gap-2 border-b-2 pb-3 px-1 text-sm ${activeTab === "pending" ? "border-primary font-bold text-primary" : "border-transparent font-medium text-slate-500 hover:text-slate-700"}`} type="button" onClick={() => setActiveTab("pending")}>
            <span className="material-symbols-outlined text-lg">inbox</span>
            Chờ xử lý ({metrics.pending})
          </button>
          <button className={`flex items-center gap-2 border-b-2 pb-3 px-1 text-sm ${activeTab === "severe" ? "border-primary font-bold text-primary" : "border-transparent font-medium text-slate-500 hover:text-slate-700"}`} type="button" onClick={() => setActiveTab("severe")}>
            <span className="material-symbols-outlined text-lg">priority_high</span>
            Vi phạm nặng ({metrics.severe})
          </button>
          <button className={`flex items-center gap-2 border-b-2 pb-3 px-1 text-sm ${activeTab === "recent" ? "border-primary font-bold text-primary" : "border-transparent font-medium text-slate-500 hover:text-slate-700"}`} type="button" onClick={() => setActiveTab("recent")}>
            <span className="material-symbols-outlined text-lg">new_releases</span>
            Mới phát sinh
          </button>
        </div>

        <label className="relative w-full max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400">search</span>
          <input
            className="w-full rounded-lg bg-slate-100 py-2 pl-10 pr-4 text-sm border-none focus:ring-2 focus:ring-primary/40"
            placeholder="Tìm kiếm mã tin, tiêu đề hoặc địa chỉ..."
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Tin đăng</th>
                <th className="px-6 py-4">Mức độ</th>
                <th className="px-6 py-4">Số lần báo cáo</th>
                <th className="px-6 py-4">Địa chỉ</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-sm text-slate-500" colSpan="5">Không có tin vi phạm phù hợp với bộ lọc hiện tại.</td>
                </tr>
              ) : (
                filteredRooms.map((room) => {
                  const reportMeta = getReportMeta(room);
                  return (
                    <tr className="transition-colors hover:bg-slate-50/60" key={room.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                            {getInitials(room.title)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">{room.title}</p>
                            <p className="text-xs text-slate-500">ID: #{room.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${reportMeta.className}`}>
                          {reportMeta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{room.reportedCount || 0} lượt</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{room.address || "Chưa cập nhật"}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <a
                            className="rounded-lg p-2 text-primary transition-colors hover:bg-primary/10"
                            href={`/rooms/${room.id}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined text-xl">visibility</span>
                          </a>
                          <button className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50" onClick={() => deleteViolationRoom(room.id)} title="Xóa tin" type="button">
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
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
    </div>
  );
};

export default ManageRoomsPage;
