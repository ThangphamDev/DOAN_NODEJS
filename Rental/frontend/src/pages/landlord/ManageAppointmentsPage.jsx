import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import landlordService from "@/services/LandlordService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";
import { useNotify } from "@/context/NotifyContext.jsx";
import Modal from "@/components/common/Modal";

import AppointmentDetailModal from "@/components/landlord/AppointmentDetailModal";

const RejectReasonModal = ({ open, value, onChange, onClose, onSubmit }) => (
  <Modal
    open={open}
    onClose={onClose}
    title="Lý do từ chối"
    description="Vui lòng cung cấp lý do để khách hàng nắm được thông tin."
    maxWidthClass="max-w-lg"
  >
    <div className="space-y-4">
      <textarea
        className="w-full resize-none rounded-xl border border-slate-200 p-4 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
        placeholder="Ví dụ: Tôi đã cho thuê phòng này rồi, hoặc Tôi bận vào khung giờ này..."
        rows="4"
        value={value}
        onChange={onChange}
      />
      <div className="flex justify-end gap-3">
        <button
          className="rounded-xl border border-slate-200 px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
          onClick={onClose}
        >
          Hủy bỏ
        </button>
        <button
          className="rounded-xl bg-rose-500 px-6 py-2 text-sm font-bold text-white shadow-sm hover:bg-rose-600"
          onClick={onSubmit}
        >
          Xác nhận từ chối
        </button>
      </div>
    </div>
  </Modal>
);

const ManageAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedDateFilter, setSelectedDateFilter] = useState(null);
  const [modalItem, setModalItem] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReasonText, setRejectReasonText] = useState("");
  const notify = useNotify();

  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);

    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      return d;
    });
  };

  const currentWeekDates = getWeekDates();
  const formatDay = (dateObj) => {
    // Local YYYY-MM-DD format
    const offset = dateObj.getTimezoneOffset()
    return new Date(dateObj.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0]
  };

  const filteredAppointments = appointments.filter((app) => {
    let matchFilter = true;
    if (selectedFilter === "pending") matchFilter = app.status === "pending";
    if (selectedFilter === "upcoming") {
      matchFilter = app.status === "approved" && new Date(app.scheduledAt) >= new Date();
    }

    let matchDate = true;
    if (selectedDateFilter && app.scheduledAt) {
      const appDate = new Date(app.scheduledAt);
      const offset = appDate.getTimezoneOffset();
      const appDateStr = new Date(appDate.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
      matchDate = appDateStr === selectedDateFilter;
    }

    return matchFilter && matchDate;
  });

  const loadAppointments = async () => {
    try {
      const response = await landlordService.getAppointments();
      setAppointments(getApiData(response, []));
    } catch (err) {
      notify.error(getApiMessage(err, "Không tải được lịch xem phòng"));
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const updateStatus = async (appointmentId, status) => {
    if (status === "rejected" && (!rejectReasonText || rejectReasonText.trim() === "")) {
      notify.warning("Vui lòng nhập lý do từ chối để khách hàng biết!");
      return;
    }

    try {
      await landlordService.updateAppointmentStatus(appointmentId, status, status === "rejected" ? rejectReasonText : undefined);
      notify.success("Đã cập nhật trạng thái lịch hẹn.");
      setRejectingId(null);
      setRejectReasonText("");
      await loadAppointments();
    } catch (err) {
      notify.error(getApiMessage(err, "Không thể cập nhật trạng thái lịch hẹn"));
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
    <div className="flex w-full flex-col gap-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-extrabold tracking-tight">Quản lý lịch hẹn</h2>
          <p className="text-slate-500">Dễ dàng theo dõi và lên lịch xem phòng trực tiếp với khách hàng.</p>
        </div>
        <div className="flex self-start rounded-lg bg-slate-100 p-1">
          <button onClick={() => setSelectedFilter("all")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-shadow ${selectedFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`} type="button">Tất cả</button>
          <button onClick={() => setSelectedFilter("pending")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-shadow ${selectedFilter === "pending" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`} type="button">Chờ duyệt</button>
          <button onClick={() => setSelectedFilter("upcoming")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-shadow ${selectedFilter === "upcoming" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`} type="button">Đã duyệt</button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredAppointments.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">Chưa có lịch hẹn nào phù hợp.</div>
        ) : (
          filteredAppointments.map((item) => (
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
                    {item.phone && (
                      <span className="flex items-center gap-1 font-medium text-primary">
                        <span className="material-symbols-outlined text-sm">phone_iphone</span>
                        {item.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col gap-3 md:w-auto">
                {item.status === "pending" ? (
                  <div className="flex w-full items-center justify-end gap-2 md:w-auto">
                    <button className="whitespace-nowrap rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 shadow-sm transition-colors hover:bg-rose-100" onClick={() => setRejectingId(item.id)} type="button">
                      Từ chối
                    </button>
                    <button className="whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary/90" onClick={() => updateStatus(item.id, "approved")} type="button">
                      Duyệt
                    </button>
                    <button className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-slate-500 shadow-sm hover:bg-slate-50" onClick={() => setModalItem(item)} title="Xem chi tiết" type="button">
                      <span className="material-symbols-outlined text-sm">visibility</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex w-full items-center justify-end gap-2 text-sm font-medium text-slate-500 md:w-auto">
                    <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5">
                      <span className={`material-symbols-outlined text-[16px] ${item.status === "approved" ? "text-green-500" : "text-red-500"}`}>
                        {item.status === "approved" ? "check_circle" : "block"}
                      </span>
                      {item.status === "approved" ? "Đã duyệt" : "Đã từ chối"}
                    </div>
                    <button className="rounded-lg border border-slate-200 px-2 py-1.5 text-slate-500 hover:bg-slate-50" onClick={() => setModalItem(item)} title="Xem chi tiết" type="button">
                      <span className="material-symbols-outlined text-sm">visibility</span>
                    </button>
                  </div>
                )}
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
          <button
            className="text-sm font-semibold text-primary hover:underline"
            onClick={() => { setSelectedFilter("all"); setSelectedDateFilter(null); }}
            type="button"
          >
            Xem lịch đầy đủ
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 md:grid-cols-7">
          {currentWeekDates.map((d, index) => {
            const formattedDate = formatDay(d);
            const isSelected = selectedDateFilter === formattedDate;
            const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            return (
              <div
                key={index}
                onClick={() => setSelectedDateFilter(isSelected ? null : formattedDate)}
                className={`cursor-pointer rounded-lg p-2 text-center shadow-sm transition-colors ${isSelected ? "bg-primary text-white" : "border border-primary/10 bg-white hover:bg-slate-50"}`}
              >
                <span className={`text-[10px] font-bold uppercase ${isSelected ? "text-white/70" : "text-slate-400"}`}>{dayNames[index]}</span>
                <div className={`text-sm font-bold ${isSelected ? "text-white" : "text-slate-700"}`}>{d.getDate()}</div>
              </div>
            );
          })}
        </div>
      </div>

      <AppointmentDetailModal
        open={!!modalItem}
        item={modalItem}
        onClose={() => setModalItem(null)}
      />

      <RejectReasonModal
        open={!!rejectingId}
        value={rejectReasonText}
        onChange={(e) => setRejectReasonText(e.target.value)}
        onClose={() => { setRejectingId(null); setRejectReasonText(""); }}
        onSubmit={() => updateStatus(rejectingId, "rejected")}
      />
    </div>
  );
};

export default ManageAppointmentsPage;
