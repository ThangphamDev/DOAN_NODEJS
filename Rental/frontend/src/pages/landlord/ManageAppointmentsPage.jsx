import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import landlordService from "@/services/LandlordService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const ManageAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadAppointments = async () => {
    try {
      const response = await landlordService.getAppointments();
      setAppointments(getApiData(response, []));
      setError("");
    } catch (err) {
      setError(getApiMessage(err, "Không tải được lịch xem phòng"));
      setSuccessMessage("");
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const updateStatus = async (appointmentId, status) => {
    try {
      await landlordService.updateAppointmentStatus(appointmentId, status);
      setSuccessMessage("Đã cập nhật trạng thái lịch hẹn.");
      setError("");
      await loadAppointments();
    } catch (err) {
      setError(getApiMessage(err, "Không thể cập nhật trạng thái lịch hẹn"));
      setSuccessMessage("");
    }
  };

  const getStatusLabel = (status) => {
    if (status === "approved") return "Đã duyệt";
    if (status === "rejected") return "Từ chối";
    return "Chờ duyệt";
  };

  const getStatusClass = (status) => {
    if (status === "approved") return "bg-green-50 text-green-700 ring-green-600/20";
    if (status === "rejected") return "bg-red-50 text-red-700 ring-red-600/20";
    return "bg-amber-50 text-amber-700 ring-amber-600/20";
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Yêu cầu xem phòng</h1>
          <p className="text-slate-500">Quản lý và lên lịch xem phòng cho các căn đang cho thuê.</p>
        </div>
        <div className="flex self-start rounded-lg bg-slate-100 p-1">
          <button className="rounded-md bg-white px-4 py-1.5 text-sm font-medium text-slate-900 shadow-sm" type="button">Tất cả</button>
          <button className="px-4 py-1.5 text-sm font-medium text-slate-500" type="button">Chờ duyệt</button>
          <button className="px-4 py-1.5 text-sm font-medium text-slate-500" type="button">Sắp tới</button>
        </div>
      </div>

      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {successMessage && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p>}

      <div className="grid gap-4">
        {appointments.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">Chưa có lịch hẹn nào cần xử lý.</div>
        ) : (
          appointments.map((item) => (
            <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md md:flex-row md:items-center" key={item.id}>
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 bg-slate-100 text-sm font-bold text-primary">
                  {(item.customer?.fullName || "K").slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{item.customer?.fullName || "Khách quan tâm"}</h3>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusClass(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-500">{item.room?.title || "Phòng đang quan tâm"}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      {item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString() : "Chưa rõ ngày"}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {item.scheduledAt ? new Date(item.scheduledAt).toLocaleTimeString() : "Chưa rõ giờ"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex w-full items-center gap-3 md:w-auto">
                <button className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 md:flex-none" onClick={() => updateStatus(item.id, "rejected")} type="button">
                  Từ chối
                </button>
                <button className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 md:flex-none" onClick={() => updateStatus(item.id, "approved")} type="button">
                  Duyệt
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="flex items-center gap-2 font-bold">
            <span className="material-symbols-outlined text-primary">event_note</span>
            Tổng quan tuần này
          </h4>
          <NavLink className="text-sm font-semibold text-primary hover:underline" to="/landlord">
            Xem lịch đầy đủ
          </NavLink>
        </div>
        <div className="grid grid-cols-4 gap-2 md:grid-cols-7">
          <div className="rounded-lg border border-primary/10 bg-white p-2 text-center shadow-sm">
            <span className="text-[10px] font-bold uppercase text-slate-400">Mon</span>
            <div className="text-sm font-bold text-slate-700">23</div>
          </div>
          <div className="rounded-lg bg-primary p-2 text-center text-white shadow-md">
            <span className="text-[10px] font-bold uppercase text-white/70">Tue</span>
            <div className="text-sm font-bold">24</div>
          </div>
          <div className="rounded-lg border border-primary/10 bg-white p-2 text-center shadow-sm">
            <span className="text-[10px] font-bold uppercase text-slate-400">Wed</span>
            <div className="text-sm font-bold text-slate-700">25</div>
          </div>
          <div className="rounded-lg border border-primary/10 bg-white p-2 text-center shadow-sm">
            <span className="text-[10px] font-bold uppercase text-slate-400">Thu</span>
            <div className="text-sm font-bold text-slate-700">26</div>
          </div>
          <div className="rounded-lg border border-primary/10 bg-white p-2 text-center shadow-sm">
            <span className="text-[10px] font-bold uppercase text-slate-400">Fri</span>
            <div className="text-sm font-bold text-slate-700">27</div>
          </div>
          <div className="rounded-lg border border-primary/10 bg-white p-2 text-center shadow-sm">
            <span className="text-[10px] font-bold uppercase text-slate-400">Sat</span>
            <div className="text-sm font-bold text-slate-700">28</div>
          </div>
          <div className="rounded-lg border border-primary/10 bg-white p-2 text-center shadow-sm">
            <span className="text-[10px] font-bold uppercase text-slate-400">Sun</span>
            <div className="text-sm font-bold text-slate-700">29</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAppointmentsPage;
