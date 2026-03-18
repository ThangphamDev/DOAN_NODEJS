import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import landlordService from "@/services/LandlordService";
import chatService from "@/services/ChatService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const LandlordDashboardPage = () => {
  const [rooms, setRooms] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadData = async () => {
    try {
      const [roomsRes, appointmentsRes, inboxRes] = await Promise.all([
        landlordService.getMyRooms(),
        landlordService.getAppointments(),
        chatService.getInbox()
      ]);
      setRooms(getApiData(roomsRes, []));
      setAppointments(getApiData(appointmentsRes, []));
      setInbox(getApiData(inboxRes, []));
      setError("");
    } catch (err) {
      setError(getApiMessage(err, "Không tải được dữ liệu chủ trọ"));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const chartData = useMemo(() => {
    const allReviews = rooms.flatMap((r) => r.reviews || []);
    const reviewTotal = allReviews.length || 1; 

    const appTotal = appointments.length || 1;
    const msgTotal = inbox.length || 1;

    return {
      appointments: [
        { label: "Đã duyệt", count: appointments.filter(a => a.status === 'approved').length, color: "bg-green-500", total: appTotal },
        { label: "Chờ duyệt", count: appointments.filter(a => a.status === 'pending').length, color: "bg-amber-400", total: appTotal },
        { label: "Từ chối", count: appointments.filter(a => a.status === 'rejected').length, color: "bg-rose-500", total: appTotal },
      ],
      reviews: [
        { label: "Rất tốt (5 sao)", count: allReviews.filter(r => Number(r.rating) === 5).length, color: "bg-green-500", total: reviewTotal },
        { label: "Khá (4 sao)", count: allReviews.filter(r => Number(r.rating) === 4).length, color: "bg-blue-400", total: reviewTotal },
        { label: "Cần chú ý (< 4)", count: allReviews.filter(r => Number(r.rating) < 4).length, color: "bg-amber-500", total: reviewTotal },
      ],
      messages: [
        { label: "Quan tâm", count: inbox.filter(i => !i.blockedByMe).length, color: "bg-blue-500", total: msgTotal },
        { label: "Đã chặn (Spam)", count: inbox.filter(i => i.blockedByMe).length, color: "bg-slate-400", total: msgTotal },
      ]
    };
  }, [appointments, rooms, inbox]);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-extrabold tracking-tight">Bảng điều khiển chủ trọ</h2>
          <p className="text-slate-500">Tổng quan hoạt động cho thuê và theo dõi lịch hẹn cần xử lý.</p>
        </div>
        <NavLink className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all shadow-sm shadow-primary/20 hover:bg-primary/90" to="/landlord/rooms">
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Thêm tin đăng mới
        </NavLink>
      </div>

      {error && <p className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {successMessage && <p className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p>}

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Tổng tin đăng</p>
            <span className="material-symbols-outlined text-primary">apartment</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{rooms.filter(r => r.status === 'active').length}</p>
            <p className="flex items-center text-sm font-semibold text-slate-500">/ {rooms.length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Lịch hẹn chờ duyệt</p>
            <span className="material-symbols-outlined text-primary">schedule</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{appointments.filter(a => a.status === 'pending').length}</p>
            <p className="flex items-center text-sm font-semibold text-green-600">Mới <span className="material-symbols-outlined text-sm">schedule</span></p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Tin nhắn khách thuê</p>
            <span className="material-symbols-outlined text-primary">mail</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{inbox.length}</p>
            <p className="flex items-center text-sm font-semibold text-blue-500">Khách <span className="material-symbols-outlined text-sm">group</span></p>
          </div>
        </div>
      </div>

      <div className="mb-10 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h3 className="text-lg font-bold">Tin đăng của tôi</h3>
          <div className="flex items-center gap-2">
            <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
            <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button">
              <span className="material-symbols-outlined">search</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Phòng</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Giá thuê</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rooms.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-slate-500" colSpan="4">Bạn chưa có tin đăng nào.</td>
                </tr>
              ) : (
                rooms.slice(0, 3).map((room) => (
                  <tr className="transition-colors hover:bg-slate-50" key={room.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                          {room.title?.slice(0, 1)?.toUpperCase() || "P"}
                        </div>
                        <div className="font-medium">{room.title}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${room.status === "hidden" ? "bg-slate-100 text-slate-800" : room.status === "rented" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                        {room.status === "hidden" ? "Đã ẩn" : room.status === "rented" ? "Đã thuê" : "Đang hiển thị"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {Number(room.price || 0).toLocaleString("vi-VN")} đ/tháng
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <NavLink className="text-primary transition-colors hover:text-primary/80" to="/landlord/rooms">Sửa</NavLink>
                        <span className="text-slate-300">|</span>
                        <NavLink className="text-red-500 transition-colors hover:text-red-600" to="/landlord/rooms">Quản lý</NavLink>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Lịch hẹn Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold">Thống kê Lịch hẹn</h3>
            <span className="material-symbols-outlined text-slate-400">monitoring</span>
          </div>
          <div className="flex flex-col gap-5">
            {chartData.appointments.map((stat, i) => {
              const pct = appointments.length === 0 ? 0 : Math.round((stat.count / stat.total) * 100);
              return (
              <div key={i}>
                <div className="mb-1.5 flex justify-between text-sm font-semibold">
                  <span>{stat.label}</span>
                  <span className="text-slate-500">{stat.count} ({pct}%)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full ${stat.color} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            )})}
          </div>
          <NavLink className="mt-6 block w-full rounded-lg bg-slate-50 py-2.5 text-center text-sm font-bold text-primary transition-colors hover:bg-slate-100" to="/landlord/appointments">Xem chi tiết lịch hẹn</NavLink>
        </div>

        {/* Đánh giá Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold">Điểm đánh giá</h3>
            <span className="material-symbols-outlined text-slate-400">star_rate</span>
          </div>
          <div className="flex flex-col gap-5">
            {chartData.reviews.map((stat, i) => {
              const allR = rooms.flatMap((r) => r.reviews || []);
              const pct = allR.length === 0 ? 0 : Math.round((stat.count / stat.total) * 100);
              return (
              <div key={i}>
                <div className="mb-1.5 flex justify-between text-sm font-semibold">
                  <span>{stat.label}</span>
                  <span className="text-slate-500">{stat.count} ({pct}%)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full ${stat.color} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            )})}
          </div>
          <NavLink className="mt-6 block w-full rounded-lg bg-slate-50 py-2.5 text-center text-sm font-bold text-primary transition-colors hover:bg-slate-100" to="/landlord/reviews">Xem phản hồi khách</NavLink>
        </div>

        {/* Tin nhắn Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold">Tương tác nhắn tin</h3>
            <span className="material-symbols-outlined text-slate-400">forum</span>
          </div>
          <div className="flex flex-col gap-5">
            {chartData.messages.map((stat, i) => {
              const countInbox = inbox.length;
              const pct = countInbox === 0 ? 0 : Math.round((stat.count / stat.total) * 100);
              return (
              <div key={i}>
                <div className="mb-1.5 flex justify-between text-sm font-semibold">
                  <span>{stat.label}</span>
                  <span className="text-slate-500">{stat.count} ({pct}%)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full ${stat.color} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            )})}
          </div>
          <NavLink className="mt-6 block w-full rounded-lg bg-slate-50 py-2.5 text-center text-sm font-bold text-primary transition-colors hover:bg-slate-100" to="/landlord/messages">Mở hộp thư ngay</NavLink>
        </div>
      </div>
    </>
  );
};

export default LandlordDashboardPage;
