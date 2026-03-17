import { useEffect, useMemo, useState } from "react";
import ConfirmActionModal from "@/components/admin/ConfirmActionModal";
import ReportedRoomDetailModal from "@/components/admin/ReportedRoomDetailModal";
import { useNotify } from "@/context/NotifyContext.jsx";
import adminService from "@/services/AdminService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const getInitials = (value) =>
  (value || "RM")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const getReportMeta = (count) => {
  if (count >= 3) {
    return {
      label: "Vi phạm nặng",
      className: "bg-red-100 text-red-700",
    };
  }

  if (count === 2) {
    return {
      label: "Cần xử lý gấp",
      className: "bg-amber-100 text-amber-700",
    };
  }

  return {
    label: "Mới phát sinh",
    className: "bg-primary/10 text-primary",
  };
};

const ManageRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [roomPendingDelete, setRoomPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const notify = useNotify();

  const loadReportedRooms = async () => {
    try {
      const response = await adminService.getReportedRooms();
      const nextRooms = getApiData(response, []);
      setRooms(nextRooms);

      if (selectedRoomId && !nextRooms.some((room) => String(room.id) === String(selectedRoomId))) {
        setSelectedRoomId(null);
        setSelectedRoom(null);
      }
    } catch (err) {
      notify.error(getApiMessage(err, "Không tải được danh sách tin vi phạm"));
    }
  };

  const loadRoomDetail = async (roomId) => {
    try {
      setSelectedRoomId(roomId);
      setIsDetailLoading(true);
      setDetailError("");
      const response = await adminService.getReportedRoomDetail(roomId);
      setSelectedRoom(getApiData(response, null));
    } catch (err) {
      setSelectedRoom(null);
      setDetailError(getApiMessage(err, "Không tải được chi tiết báo cáo"));
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    loadReportedRooms();
  }, []);

  const deleteViolationRoom = async (roomId) => {
    try {
      setIsDeleting(true);
      await adminService.deleteRoom(roomId);
      notify.success("Đã xóa tin vi phạm.");
      setRoomPendingDelete(null);

      if (String(selectedRoomId) === String(roomId)) {
        setSelectedRoomId(null);
        setSelectedRoom(null);
      }

      await loadReportedRooms();
    } catch (err) {
      notify.error(getApiMessage(err, "Không thể xóa tin vi phạm"));
    } finally {
      setIsDeleting(false);
    }
  };

  const metrics = useMemo(() => {
    const totalReports = rooms.reduce((sum, room) => sum + Number(room.reportedCount || 0), 0);
    return {
      pending: rooms.length,
      severe: rooms.filter((room) => Number(room.reportedCount || 0) >= 3).length,
      totalReports,
      impactedAreas: new Set(rooms.map((room) => room.area || room.address || `#${room.id}`)).size,
    };
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();

    return rooms.filter((room) => {
      const reportCount = Number(room.reportedCount || 0);
      const matchesTab =
        activeTab === "pending"
          ? true
          : activeTab === "severe"
            ? reportCount >= 3
            : reportCount <= 1;
      const haystack = `${room.id} ${room.title || ""} ${room.address || ""} ${room.landlord?.fullName || ""}`.toLowerCase();
      return matchesTab && (!normalized || haystack.includes(normalized));
    });
  }, [activeTab, rooms, searchQuery]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Quản lý tin đăng vi phạm</h2>
          <p className="text-slate-500">Admin xem danh sách báo cáo, mở chi tiết từng báo cáo và xóa tin đăng vi phạm.</p>
        </div>
      </div>

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
            <span className="text-xs font-bold uppercase tracking-wider">Khu vực</span>
          </div>
          <div className="text-2xl font-bold">{metrics.impactedAreas}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-8 border-b border-slate-200">
          <button
            className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm ${activeTab === "pending" ? "border-primary font-bold text-primary" : "border-transparent font-medium text-slate-500 hover:text-slate-700"}`}
            type="button"
            onClick={() => setActiveTab("pending")}
          >
            <span className="material-symbols-outlined text-lg">inbox</span>
            Chờ xử lý ({metrics.pending})
          </button>
          <button
            className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm ${activeTab === "severe" ? "border-primary font-bold text-primary" : "border-transparent font-medium text-slate-500 hover:text-slate-700"}`}
            type="button"
            onClick={() => setActiveTab("severe")}
          >
            <span className="material-symbols-outlined text-lg">priority_high</span>
            Vi phạm nặng ({metrics.severe})
          </button>
          <button
            className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm ${activeTab === "recent" ? "border-primary font-bold text-primary" : "border-transparent font-medium text-slate-500 hover:text-slate-700"}`}
            type="button"
            onClick={() => setActiveTab("recent")}
          >
            <span className="material-symbols-outlined text-lg">new_releases</span>
            Mới phát sinh
          </button>
        </div>

        <label className="relative w-full max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400">search</span>
          <input
            className="w-full rounded-lg border-none bg-slate-100 py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/40"
            placeholder="Tìm mã tin, tiêu đề, địa chỉ, chủ trọ..."
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
                <th className="px-6 py-4">Chủ trọ</th>
                <th className="px-6 py-4">Mức độ</th>
                <th className="px-6 py-4">Báo cáo</th>
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
                  const reportMeta = getReportMeta(Number(room.reportedCount || 0));

                  return (
                    <tr className="transition-colors hover:bg-slate-50/60" key={room.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                            {getInitials(room.title)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">{room.title}</p>
                            <p className="text-xs text-slate-500">ID #{room.id} - {room.address || "Chưa cập nhật"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="font-semibold text-slate-900">{room.landlord?.fullName || "Chưa xác định"}</div>
                        <div className="text-xs text-slate-500">{room.landlord?.email || room.landlord?.phone || "Không có liên hệ"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${reportMeta.className}`}>
                          {reportMeta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{room.reportedCount || 0} lượt</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                            onClick={() => loadRoomDetail(room.id)}
                            title="Xem chi tiết báo cáo"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-xl">visibility</span>
                          </button>
                          <a
                            className="rounded-lg p-2 text-primary transition-colors hover:bg-primary/10"
                            href={`/rooms/${room.id}`}
                            rel="noreferrer"
                            target="_blank"
                            title="Mở trang chi tiết phòng"
                          >
                            <span className="material-symbols-outlined text-xl">open_in_new</span>
                          </a>
                          <button
                            className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                            onClick={() => setRoomPendingDelete(room)}
                            title="Xóa tin"
                            type="button"
                          >
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

      <ReportedRoomDetailModal
        error={detailError}
        isLoading={isDetailLoading}
        onClose={() => {
          setSelectedRoomId(null);
          setSelectedRoom(null);
          setDetailError("");
        }}
        onDelete={(roomId) => setRoomPendingDelete(rooms.find((room) => room.id === roomId) || selectedRoom)}
        open={Boolean(selectedRoomId)}
        room={selectedRoom}
      />

      <ConfirmActionModal
        confirmClassName="bg-red-500 hover:bg-red-600"
        confirmLabel="Xóa tin"
        description={`Bạn có chắc muốn xóa tin "${roomPendingDelete?.title || ""}"? Hành động này sẽ ẩn tin khỏi hệ thống.`}
        isSubmitting={isDeleting}
        onClose={() => setRoomPendingDelete(null)}
        onConfirm={() => deleteViolationRoom(roomPendingDelete.id)}
        open={Boolean(roomPendingDelete)}
        title="Xác nhận xóa tin vi phạm"
      />
    </div>
  );
};

export default ManageRoomsPage;
