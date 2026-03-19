import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LoadingState from "@/components/common/LoadingState";
import { useNotify } from "@/context/NotifyContext.jsx";
import roomService from "@/services/RoomService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";
import { resolveRoomImageUrl } from "@/utils/roomDetails";

const STATUS_CONFIG = {
  all: {
    label: "Tất cả",
    bgClass: "bg-slate-100 text-slate-600 border-slate-200",
    activeClass: "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200",
    borderColor: "border-l-slate-300",
  },
  pending: {
    label: "Chờ duyệt",
    icon: "schedule",
    bgClass: "bg-amber-50 text-amber-700 border-amber-100",
    activeClass: "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-200",
    dotClass: "bg-amber-500",
    borderColor: "border-l-amber-400",
  },
  approved: {
    label: "Đã duyệt",
    icon: "check_circle",
    bgClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
    activeClass: "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200",
    dotClass: "bg-emerald-500",
    borderColor: "border-l-emerald-500",
  },
  rejected: {
    label: "Từ chối",
    icon: "cancel",
    bgClass: "bg-rose-50 text-rose-700 border-rose-100",
    activeClass: "bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-200",
    dotClass: "bg-rose-500",
    borderColor: "border-l-rose-500",
  },
  cancelled: {
    label: "Đã hủy",
    icon: "event_busy",
    bgClass: "bg-slate-100 text-slate-600 border-slate-200",
    activeClass: "bg-slate-700 text-white border-slate-700 shadow-lg shadow-slate-200",
    dotClass: "bg-slate-400",
    borderColor: "border-l-slate-400",
  },
};

const formatDateTime = (value) => {
  if (!value) return "Chưa rõ thời gian";
  return new Date(value).toLocaleString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AppointmentsPage = () => {
  const notify = useNotify();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [cancellingId, setCancellingId] = useState(null);

  const uploadBaseUrl = useMemo(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    return apiBaseUrl.replace(/\/api\/?$/, "");
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadAppointments = async () => {
      try {
        const response = await roomService.getMyAppointments();
        if (!isMounted) return;
        setAppointments(getApiData(response, []));
      } catch (err) {
        if (!isMounted) return;
        setError(getApiMessage(err, "Không tải được lịch hẹn của bạn"));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadAppointments();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredAppointments = useMemo(() => {
    let list = [...appointments].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    if (activeTab !== "all") {
      list = list.filter((item) => item.status === activeTab);
    }
    return list;
  }, [activeTab, appointments]);

  const handleCancelAppointment = async (appointmentId) => {
    setCancellingId(appointmentId);
    try {
      const response = await roomService.cancelAppointment(appointmentId);
      const payload = getApiData(response, {});
      const updatedAppointment = payload?.appointment || payload;

      setAppointments((prev) =>
        prev.map((item) => (Number(item.id) === Number(appointmentId) ? { ...item, ...updatedAppointment } : item))
      );
      notify.success("Đã hủy lịch hẹn.");
    } catch (err) {
      notify.error(getApiMessage(err, "Không thể hủy lịch hẹn"));
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200" />
          <div className="mt-3 h-5 w-96 animate-pulse rounded-lg bg-slate-100" />
        </div>
        <LoadingState count={4} variant="list" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 border-b border-slate-100 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Lịch hẹn của tôi
          </h1>
          <p className="mt-2 text-base text-slate-500">
            Theo dõi trạng thái các yêu cầu xem phòng và chủ động hủy lịch nếu bạn thay đổi kế hoạch.
          </p>
        </div>
        <Link
          className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-primary hover:text-primary"
          to="/rooms"
        >
          <span className="material-symbols-outlined text-lg">search</span>
          Tìm thêm phòng
        </Link>
      </div>

      {error ? (
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
          <span className="material-symbols-outlined">report</span>
          {error}
        </div>
      ) : null}

      <div className="mb-8 flex flex-wrap items-center gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const isActive = activeTab === key;
          const count = key === "all" ? appointments.length : appointments.filter((item) => item.status === key).length;

          if (key !== "all" && count === 0) return null;

          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-bold transition-all ${
                isActive ? cfg.activeClass : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }`}
              type="button"
            >
              {cfg.dotClass && !isActive ? <span className={`h-2 w-2 rounded-full ${cfg.dotClass}`} /> : null}
              {cfg.label}
              <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${isActive ? "bg-white/20" : "bg-slate-100 text-slate-400"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-24 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white text-slate-300 shadow-xl shadow-slate-200/50">
            <span className="material-symbols-outlined text-5xl">event_busy</span>
          </div>
          <h3 className="mb-2 text-xl font-bold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            {activeTab === "all" ? "Chưa có lịch hẹn nào" : `Không có lịch hẹn nào ${STATUS_CONFIG[activeTab].label.toLowerCase()}`}
          </h3>
          <p className="mb-10 max-w-xs font-medium text-slate-400">
            Mọi yêu cầu xem phòng của bạn sẽ hiển thị tại đây sau khi bạn gửi qua trang chi tiết phòng.
          </p>
          <Link
            className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary-dark active:scale-95"
            to="/rooms"
          >
            Bắt đầu tìm phòng
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredAppointments.map((item) => {
            const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            const imageUrl = resolveRoomImageUrl(item.room?.images?.[0]?.imageUrl || "", uploadBaseUrl);
            const canCancel = item.status === "pending" || item.status === "approved";
            const isCancelling = Number(cancellingId) === Number(item.id);

            return (
              <div key={item.id} className="group relative">
                <div className={`relative flex flex-col gap-5 rounded-2xl border border-slate-100 bg-white p-5 transition-all duration-200 hover:border-slate-200 hover:shadow-md sm:flex-row sm:items-center border-l-[3px] ${status.borderColor}`}>
                  <div className="relative h-36 w-full overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-44">
                    {imageUrl ? (
                      <img alt={item.room?.title || "Phòng quan tâm"} className="h-full w-full object-cover" src={imageUrl} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <span className="material-symbols-outlined text-4xl">home_work</span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${status.bgClass}`}>
                        <span className="material-symbols-outlined text-xs">{status.icon}</span>
                        {status.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDateTime(item.createdAt).split(",")[1] || formatDateTime(item.createdAt)}
                      </span>
                    </div>
                    <h2 className="mb-2 line-clamp-1 text-lg font-bold text-slate-900 transition-colors group-hover:text-primary" style={{ fontFamily: "var(--font-display)" }}>
                      {item.room?.title || "Yêu cầu xem phòng"}
                    </h2>

                    <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="material-symbols-outlined text-lg text-slate-300">location_on</span>
                        <span className="truncate">{item.room?.address || "Đang cập nhật địa chỉ"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 sm:justify-end">
                        <span className="font-bold text-slate-900">Lịch xem:</span>
                        <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1 font-bold text-primary">
                          <span className="material-symbols-outlined text-base">calendar_month</span>
                          {formatDateTime(item.scheduledAt)}
                        </span>
                      </div>
                    </div>

                    {item.note ? (
                      <div className="mt-4 flex gap-3 rounded-xl bg-slate-50/50 p-3 text-sm italic text-slate-500">
                        <span className="material-symbols-outlined text-base text-slate-300">format_quote</span>
                        <p className="line-clamp-2 leading-relaxed">{item.note}</p>
                      </div>
                    ) : null}

                    {item.rejectReason ? (
                      <div className="mt-4 flex gap-3 rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-sm text-rose-700">
                        <span className="material-symbols-outlined text-base">info</span>
                        <p className="leading-relaxed"><strong>Lý do từ chối:</strong> {item.rejectReason}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex w-full shrink-0 items-center justify-end gap-2 border-t border-slate-50 pt-3 sm:w-auto sm:flex-col sm:justify-center sm:border-t-0 sm:pt-0">
                    {item.room?.id ? (
                      <Link
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 transition-all hover:border-primary hover:text-primary hover:shadow-lg"
                        title="Xem chi tiết phòng"
                        to={`/rooms/${item.room.id}`}
                      >
                        <span className="material-symbols-outlined">open_in_new</span>
                      </Link>
                    ) : null}

                      <a
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
                      href={item.phone ? `tel:${item.phone}` : "#"}
                      onClick={(event) => !item.phone && event.preventDefault()}
                    >
                      <span className="material-symbols-outlined text-base">call</span>
                      Liên hệ
                    </a>

                    {canCancel ? (
                      <button
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition-all hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isCancelling}
                        onClick={() => handleCancelAppointment(item.id)}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-base">event_busy</span>
                        {isCancelling ? "Đang hủy..." : "Hủy lịch"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
