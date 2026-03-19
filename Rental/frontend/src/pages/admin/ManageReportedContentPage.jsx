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
    label: "Đã xử lý",
    className: "bg-emerald-100 text-emerald-700",
  },
  deleted: {
    label: "Đã xóa",
    className: "bg-rose-100 text-rose-700",
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
  const [activeTab, setActiveTab] = useState("all");
  const [loadError, setLoadError] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [reportPendingResolve, setReportPendingResolve] = useState(null);
  const [reportPendingDelete, setReportPendingDelete] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const [isDeletingReport, setIsDeletingReport] = useState(false);
  const notify = useNotify();

  const loadReports = async () => {
    try {
      const response = await adminService.getReportedContent("all");
      setReports(getApiData(response, []));
      setLoadError("");
    } catch (err) {
      const message = getApiMessage(err, "Không tải được nội dung bị báo cáo");
      setLoadError(message);
      notify.error(message);
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

  const deleteReport = async (reportId) => {
    try {
      setIsDeletingReport(true);
      await adminService.updateReportStatus(reportId, "deleted");
      notify.success("Đã chuyển báo cáo sang trạng thái đã xóa.");
      setReportPendingDelete(null);
      setActiveTab("deleted");
      await loadReports();
    } catch (err) {
      notify.error(getApiMessage(err, "Không thể cập nhật trạng thái báo cáo"));
    } finally {
      setIsDeletingReport(false);
    }
  };

  const resolveReport = async (reportId) => {
    try {
      setIsResolving(true);
      await adminService.updateReportStatus(reportId, "resolved");
      notify.success("Đã xử lý báo cáo.");
      setReportPendingResolve(null);
      setActiveTab("resolved");
      await loadReports();
    } catch (err) {
      notify.error(getApiMessage(err, "Không thể xử lý báo cáo"));
    } finally {
      setIsResolving(false);
    }
  };

  const metrics = useMemo(() => ({
    total: reports.length,
    pending: reports.filter((report) => report.status === "pending").length,
    resolved: reports.filter((report) => report.status === "resolved").length,
    deleted: reports.filter((report) => report.status === "deleted").length,
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

      {loadError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {loadError}
        </div>
      ) : null}

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
            <span className="text-xs font-bold uppercase tracking-wider">Đã xử lý</span>
          </div>
          <div className="text-2xl font-bold">{metrics.resolved}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-3 text-slate-500">
            <span className="material-symbols-outlined">delete</span>
            <span className="text-xs font-bold uppercase tracking-wider">Đã xóa</span>
          </div>
          <div className="text-2xl font-bold">{metrics.deleted}</div>
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
            ["all", `Tất cả (${metrics.total})`],
            ["pending", `Chờ xử lý (${metrics.pending})`],
            ["resolved", `Đã xử lý (${metrics.resolved})`],
            ["deleted", `Đã xóa (${metrics.deleted})`],
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
                          {report.room?.id ? (
                            <button
                              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                              onClick={() => loadRoomDetail(report.room.id)}
                              title="Xem chi tiết"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-xl">visibility</span>
                            </button>
                          ) : null}
                          {report.roomLink && report.room?.status !== "deleted" ? (
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
                          {report.status === "pending" ? (
                            <button
                              className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                              onClick={() => setReportPendingResolve(report)}
                              title="Đánh dấu đã xử lý"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-xl">task_alt</span>
                            </button>
                          ) : null}
                          {report.status === "pending" ? (
                            <button
                              className="rounded-lg p-2 text-rose-500 transition-colors hover:bg-rose-50"
                              onClick={() => setReportPendingDelete(report)}
                              title="Đánh dấu đã xóa"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-xl">delete</span>
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
        actionSlot={
          selectedRoom?.roomLink ? (
            <a
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              href="/admin/rooms"
            >
              <span className="material-symbols-outlined text-lg">shield</span>
              Quản lý tin vi phạm
            </a>
          ) : null
        }
        error={detailError}
        isLoading={isDetailLoading}
        onClose={() => {
          setSelectedRoomId(null);
          setSelectedRoom(null);
          setDetailError("");
        }}
        open={Boolean(selectedRoomId)}
        room={selectedRoom}
      />

      <ConfirmActionModal
        confirmClassName="bg-red-500 hover:bg-red-600"
        confirmLabel="Xử lý báo cáo"
        description={`Bạn có chắc muốn đánh dấu báo cáo của "${reportPendingResolve?.reporter?.fullName || reportPendingResolve?.reporter?.email || "người dùng"}" là đã xử lý? Tin đăng sẽ không bị xóa ở màn hình này.`}
        isSubmitting={isResolving}
        onClose={() => setReportPendingResolve(null)}
        onConfirm={() => resolveReport(reportPendingResolve.id)}
        open={Boolean(reportPendingResolve)}
        title="Xác nhận xử lý báo cáo"
      />

      <ConfirmActionModal
        confirmClassName="bg-slate-700 hover:bg-slate-800"
        confirmLabel="Đánh dấu đã xóa"
        description={`Bạn có chắc muốn chuyển báo cáo của "${reportPendingDelete?.reporter?.fullName || reportPendingDelete?.reporter?.email || "người dùng"}" sang trạng thái đã xóa? Báo cáo vẫn được lưu trong cơ sở dữ liệu.`}
        isSubmitting={isDeletingReport}
        onClose={() => setReportPendingDelete(null)}
        onConfirm={() => deleteReport(reportPendingDelete.id)}
        open={Boolean(reportPendingDelete)}
        title="Xác nhận xóa báo cáo"
      />
    </div>
  );
};

export default ManageReportedContentPage;
