import { useEffect, useMemo, useState } from "react";
import ConfirmActionModal from "@/components/admin/ConfirmActionModal";
import ReportedRoomDetailModal from "@/components/admin/ReportedRoomDetailModal";
import { useNotify } from "@/context/NotifyContext.jsx";
import adminService from "@/services/AdminService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const statusMap = {
  pending: {
    label: "Chờ xử lý",
    className: "bg-amber-100 text-amber-700",
  },
  resolved: {
    label: "Đã xóa tin",
    className: "bg-emerald-100 text-emerald-700",
  },
  dismissed: {
    label: "Bỏ qua báo cáo",
    className: "bg-slate-200 text-slate-700",
  },
};

const formatDateTime = (value) => {
  if (!value) {
    return "Chưa cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

const toImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
  return `${apiBaseUrl}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
};

const ManageReportedContentPage = () => {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [roomPendingDelete, setRoomPendingDelete] = useState(null);
  const [reportPendingDismiss, setReportPendingDismiss] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingReport, setIsUpdatingReport] = useState(false);
  const notify = useNotify();

  const loadReports = async () => {
    try {
      const response = await adminService.getReportedContent("all");
      setReports(getApiData(response, []));
    } catch (err) {
      notify.error(getApiMessage(err, "Không tải được nội dung bị báo cáo"));
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
      setDetailError(getApiMessage(err, "Không tải được chi tiết tin bị báo cáo"));
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const dismissReport = async (reportId) => {
    try {
      setIsUpdatingReport(true);
      await adminService.updateReportStatus(reportId, "dismissed");
      notify.success("Đã bỏ qua báo cáo.");
      setReportPendingDismiss(null);
      await loadReports();
    } catch (err) {
      notify.error(getApiMessage(err, "Không thể cập nhật trạng thái báo cáo"));
    } finally {
      setIsUpdatingReport(false);
    }
  };

  const deleteReportedRoom = async (roomId) => {
    try {
      setIsDeleting(true);
      await adminService.deleteRoom(roomId);
      notify.success("Đã xóa tin bị báo cáo.");
      setRoomPendingDelete(null);
      setSelectedRoomId(null);
      setSelectedRoom(null);
      await loadReports();
    } catch (err) {
      notify.error(getApiMessage(err, "Không thể xóa tin bị báo cáo"));
    } finally {
      setIsDeleting(false);
    }
  };

  const metrics = useMemo(() => ({
    pending: reports.filter((report) => report.status === "pending").length,
    resolved: reports.filter((report) => report.status === "resolved").length,
    dismissed: reports.filter((report) => report.status === "dismissed").length,
    highTrust: reports.filter((report) => Number(report.reporter?.id || 0) > 0).length,
  }), [reports]);

  const filteredReports = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesTab = activeTab === "all" ? true : report.status === activeTab;
      const haystack = `${report.reason || ""} ${report.details || ""} ${report.reporter?.fullName || ""} ${report.room?.title || ""} ${report.room?.address || ""}`.toLowerCase();
      return matchesTab && (!normalized || haystack.includes(normalized));
    });
  }, [activeTab, reports, searchQuery]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Nội dung bị báo cáo</h2>
          <p className="text-slate-500">Danh sách từng báo cáo từ cộng đồng, dùng để kiểm duyệt nhanh và xử lý chi tiết.</p>
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
          <div className="mb-2 flex items-center gap-3 text-emerald-500">
            <span className="material-symbols-outlined">delete</span>
            <span className="text-xs font-bold uppercase tracking-wider">Đã xóa</span>
          </div>
          <div className="text-2xl font-bold">{metrics.resolved}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-3 text-slate-500">
            <span className="material-symbols-outlined">close</span>
            <span className="text-xs font-bold uppercase tracking-wider">Bỏ qua</span>
          </div>
          <div className="text-2xl font-bold">{metrics.dismissed}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-3 text-primary">
            <span className="material-symbols-outlined">groups</span>
            <span className="text-xs font-bold uppercase tracking-wider">Người báo cáo</span>
          </div>
          <div className="text-2xl font-bold">{metrics.highTrust}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-8 border-b border-slate-200">
          {[
            ["pending", `Chờ xử lý (${metrics.pending})`],
            ["resolved", `Đã xóa (${metrics.resolved})`],
            ["dismissed", `Bỏ qua (${metrics.dismissed})`],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm ${activeTab === key ? "border-primary font-bold text-primary" : "border-transparent font-medium text-slate-500 hover:text-slate-700"}`}
              onClick={() => setActiveTab(key)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        <label className="relative w-full max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400">search</span>
          <input
            className="w-full rounded-lg border-none bg-slate-100 py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/40"
            placeholder="Tìm lý do báo cáo, người báo cáo, tin đăng..."
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
                <th className="px-6 py-4">Lý do báo cáo</th>
                <th className="px-6 py-4">Người báo cáo</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-sm text-slate-500" colSpan="5">Không có nội dung nào khớp với bộ lọc hiện tại.</td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const statusMeta = statusMap[report.status] || statusMap.pending;
                  const roomImage = toImageUrl(report.room?.images?.[0]?.imageUrl);

                  return (
                    <tr className="transition-colors hover:bg-slate-50/60" key={report.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                            {roomImage ? (
                              <img alt={report.room?.title || "Tin đăng"} className="h-full w-full object-cover" src={roomImage} />
                            ) : (
                              (report.room?.title || "TR").slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">{report.room?.title || "Tin đăng đã bị gỡ"}</p>
                            <p className="text-xs text-slate-500">#{report.room?.id || report.roomId} - {report.room?.address || "Không còn địa chỉ"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}>
                            {statusMeta.label}
                          </span>
                          <p className="text-sm font-semibold text-slate-800">{report.reason || "Báo cáo vi phạm"}</p>
                          <p className="line-clamp-2 text-xs text-slate-500">{report.details || "Người dùng không để lại mô tả bổ sung."}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="font-semibold text-slate-900">{report.reporter?.fullName || report.reporter?.email || "Người dùng"}</div>
                        <div className="text-xs text-slate-500">{report.reporter?.email || "Chưa có email"}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDateTime(report.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {report.room?.status !== "deleted" ? (
                            <button
                              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                              onClick={() => loadRoomDetail(report.room.id)}
                              title="Xem chi tiết"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-xl">visibility</span>
                            </button>
                          ) : null}
                          {report.roomLink ? (
                            <a
                              className="rounded-lg p-2 text-primary transition-colors hover:bg-primary/10"
                              href={report.roomLink}
                              rel="noreferrer"
                              target="_blank"
                              title="Mở tin đăng"
                            >
                              <span className="material-symbols-outlined text-xl">open_in_new</span>
                            </a>
                          ) : null}
                          {report.status === "pending" && report.room?.status !== "deleted" ? (
                            <button
                              className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                              onClick={() => setRoomPendingDelete(report)}
                              title="Xóa tin"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                          ) : null}
                          {report.status === "pending" ? (
                            <button
                              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
                              onClick={() => setReportPendingDismiss(report)}
                              title="Bỏ qua báo cáo"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-xl">close</span>
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

      <ReportedRoomDetailModal
        error={detailError}
        isLoading={isDetailLoading}
        onClose={() => {
          setSelectedRoomId(null);
          setSelectedRoom(null);
          setDetailError("");
        }}
        onDelete={(roomId) => {
          const matchedReport = reports.find((report) => Number(report.room?.id) === Number(roomId) && report.status === "pending");
          if (matchedReport) {
            setRoomPendingDelete(matchedReport);
          }
        }}
        open={Boolean(selectedRoomId)}
        room={selectedRoom}
      />

      <ConfirmActionModal
        confirmClassName="bg-red-500 hover:bg-red-600"
        confirmLabel="Xóa tin"
        description={`Bạn có chắc muốn xóa tin "${roomPendingDelete?.room?.title || ""}"? Tất cả báo cáo chờ xử lý của tin này sẽ được chuyển sang trạng thái đã xử lý.`}
        isSubmitting={isDeleting}
        onClose={() => setRoomPendingDelete(null)}
        onConfirm={() => deleteReportedRoom(roomPendingDelete.room.id)}
        open={Boolean(roomPendingDelete)}
        title="Xác nhận xóa tin bị báo cáo"
      />

      <ConfirmActionModal
        confirmClassName="bg-slate-700 hover:bg-slate-800"
        confirmLabel="Bỏ qua báo cáo"
        description={`Bạn có chắc muốn bỏ qua báo cáo của "${reportPendingDismiss?.reporter?.fullName || reportPendingDismiss?.reporter?.email || "người dùng"}"?`}
        isSubmitting={isUpdatingReport}
        onClose={() => setReportPendingDismiss(null)}
        onConfirm={() => dismissReport(reportPendingDismiss.id)}
        open={Boolean(reportPendingDismiss)}
        title="Xác nhận bỏ qua báo cáo"
      />
    </div>
  );
};

export default ManageReportedContentPage;
