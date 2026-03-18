import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useNotify } from "@/context/NotifyContext.jsx";
import chatService from "@/services/ChatService";
import landlordService from "@/services/LandlordService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const LandlordDashboardPage = () => {
  const [rooms, setRooms] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [inbox, setInbox] = useState([]);
  const notify = useNotify();

  const loadData = useCallback(async () => {
    try {
      const [roomsRes, appointmentsRes, inboxRes] = await Promise.all([
        landlordService.getMyRooms(),
        landlordService.getAppointments(),
        chatService.getInbox(),
      ]);
      setRooms(getApiData(roomsRes, []));
      setAppointments(getApiData(appointmentsRes, []));
      setInbox(getApiData(inboxRes, []));
    } catch (err) {
      notify.error(getApiMessage(err, "Không tải được dữ liệu chủ trọ"));
    }
  }, [notify]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  const chartData = useMemo(() => {
    const allReviews = rooms.flatMap((room) => room.reviews || []);
    const reviewTotal = allReviews.length || 1;
    const appointmentTotal = appointments.length || 1;
    const messageTotal = inbox.length || 1;

    return {
      appointments: [
        {
          label: "Đã duyệt",
          count: appointments.filter((item) => item.status === "approved").length,
          color: "bg-green-500",
          total: appointmentTotal,
        },
        {
          label: "Chờ duyệt",
          count: appointments.filter((item) => item.status === "pending").length,
          color: "bg-amber-400",
          total: appointmentTotal,
        },
        {
          label: "Từ chối",
          count: appointments.filter((item) => item.status === "rejected").length,
          color: "bg-rose-500",
          total: appointmentTotal,
        },
      ],
      reviews: [
        {
          label: "Rất tốt (5 sao)",
          count: allReviews.filter((item) => Number(item.rating) === 5).length,
          color: "bg-green-500",
          total: reviewTotal,
        },
        {
          label: "Khá (4 sao)",
          count: allReviews.filter((item) => Number(item.rating) === 4).length,
          color: "bg-blue-400",
          total: reviewTotal,
        },
        {
          label: "Cần chú ý (< 4)",
          count: allReviews.filter((item) => Number(item.rating) < 4).length,
          color: "bg-amber-500",
          total: reviewTotal,
        },
      ],
      messages: [
        {
          label: "Quan tâm",
          count: inbox.filter((item) => !item.blockedByMe).length,
          color: "bg-blue-500",
          total: messageTotal,
        },
        {
          label: "Đã chặn (Spam)",
          count: inbox.filter((item) => item.blockedByMe).length,
          color: "bg-slate-400",
          total: messageTotal,
        },
      ],
    };
  }, [appointments, inbox, rooms]);

  return (
    <>
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Tổng tin đăng</p>
            <span className="material-symbols-outlined text-primary">apartment</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{rooms.filter((room) => room.status === "active").length}</p>
            <p className="text-sm font-semibold text-slate-500">/ {rooms.length}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Lịch hẹn chờ duyệt</p>
            <span className="material-symbols-outlined text-primary">schedule</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{appointments.filter((item) => item.status === "pending").length}</p>
            <p className="text-sm font-semibold text-green-600">Mới</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Tin nhắn khách thuê</p>
            <span className="material-symbols-outlined text-primary">mail</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{inbox.length}</p>
            <p className="text-sm font-semibold text-blue-500">Khách</p>
          </div>
        </div>
      </div>

      <div className="mb-10 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h3 className="text-lg font-bold">Tin đăng của tôi</h3>
          <NavLink className="text-sm font-semibold text-primary hover:underline" to="/landlord/rooms">
            Mở trang quản lý
          </NavLink>
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
                  <td className="px-6 py-6 text-sm text-slate-500" colSpan="4">
                    Bạn chưa có tin đăng nào.
                  </td>
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
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          room.status === "hidden"
                            ? "bg-slate-100 text-slate-800"
                            : room.status === "rented"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {room.status === "hidden" ? "Đã ẩn" : room.status === "rented" ? "Đã thuê" : "Đang hiển thị"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {Number(room.price || 0).toLocaleString("vi-VN")} đ/tháng
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <NavLink className="text-primary transition-colors hover:text-primary/80" to="/landlord/rooms">
                        Quản lý
                      </NavLink>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold">Thống kê lịch hẹn</h3>
            <span className="material-symbols-outlined text-slate-400">monitoring</span>
          </div>
          <div className="flex flex-col gap-5">
            {chartData.appointments.map((stat) => {
              const percent = appointments.length === 0 ? 0 : Math.round((stat.count / stat.total) * 100);
              return (
                <div key={stat.label}>
                  <div className="mb-1.5 flex justify-between text-sm font-semibold">
                    <span>{stat.label}</span>
                    <span className="text-slate-500">
                      {stat.count} ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full ${stat.color}`} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          <NavLink
            className="mt-6 block w-full rounded-lg bg-slate-50 py-2.5 text-center text-sm font-bold text-primary transition-colors hover:bg-slate-100"
            to="/landlord/appointments"
          >
            Xem chi tiết lịch hẹn
          </NavLink>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold">Điểm đánh giá</h3>
            <span className="material-symbols-outlined text-slate-400">star_rate</span>
          </div>
          <div className="flex flex-col gap-5">
            {chartData.reviews.map((stat) => {
              const allReviews = rooms.flatMap((room) => room.reviews || []);
              const percent = allReviews.length === 0 ? 0 : Math.round((stat.count / stat.total) * 100);
              return (
                <div key={stat.label}>
                  <div className="mb-1.5 flex justify-between text-sm font-semibold">
                    <span>{stat.label}</span>
                    <span className="text-slate-500">
                      {stat.count} ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full ${stat.color}`} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          <NavLink
            className="mt-6 block w-full rounded-lg bg-slate-50 py-2.5 text-center text-sm font-bold text-primary transition-colors hover:bg-slate-100"
            to="/landlord/reviews"
          >
            Xem phản hồi khách
          </NavLink>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold">Tương tác nhắn tin</h3>
            <span className="material-symbols-outlined text-slate-400">forum</span>
          </div>
          <div className="flex flex-col gap-5">
            {chartData.messages.map((stat) => {
              const percent = inbox.length === 0 ? 0 : Math.round((stat.count / stat.total) * 100);
              return (
                <div key={stat.label}>
                  <div className="mb-1.5 flex justify-between text-sm font-semibold">
                    <span>{stat.label}</span>
                    <span className="text-slate-500">
                      {stat.count} ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full ${stat.color}`} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          <NavLink
            className="mt-6 block w-full rounded-lg bg-slate-50 py-2.5 text-center text-sm font-bold text-primary transition-colors hover:bg-slate-100"
            to="/landlord/messages"
          >
            Mở hộp thư ngay
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default LandlordDashboardPage;
