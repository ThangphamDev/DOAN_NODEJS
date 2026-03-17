import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import landlordService from "@/services/LandlordService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const initialForm = {
  title: "",
  price: "",
  area: "",
  address: "",
  description: "",
  images: [],
};

const LandlordDashboardPage = () => {
  const [form, setForm] = useState(initialForm);
  const [rooms, setRooms] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadData = async () => {
    try {
      const [roomsRes, appointmentsRes] = await Promise.all([
        landlordService.getMyRooms(),
        landlordService.getAppointments(),
      ]);
      setRooms(getApiData(roomsRes, []));
      setAppointments(getApiData(appointmentsRes, []));
      setError("");
    } catch (err) {
      setError(getApiMessage(err, "Không tải được dữ liệu chủ trọ"));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const metrics = useMemo(() => {
    const pending = appointments.filter((item) => item.status === "pending").length;
    const newMessages = appointments.filter((item) => item.status === "approved").length;

    return { listings: rooms.length, pending, newMessages };
  }, [appointments, rooms]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onImagesChange = (event) => {
    setForm((prev) => ({ ...prev, images: Array.from(event.target.files || []) }));
  };

  const createRoom = async (event) => {
    event.preventDefault();

    if (!form.title || !form.price || !form.area || !form.address) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc");
      setSuccessMessage("");
      return;
    }

    try {
      await landlordService.createRoom(form);
      setForm(initialForm);
      setSuccessMessage("Đăng tin mới thành công.");
      setError("");
      await loadData();
    } catch (err) {
      setError(getApiMessage(err, "Không thể đăng tin mới"));
      setSuccessMessage("");
    }
  };

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-extrabold tracking-tight">Bảng điều khiển chủ trọ</h2>
          <p className="text-slate-500">Tổng quan hoạt động cho thuê hôm nay và form đăng tin mới ngay trên cùng màn hình.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all shadow-sm shadow-primary/20 hover:bg-primary/90" type="button">
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Thêm tin đăng mới
        </button>
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
            <p className="text-3xl font-bold">{metrics.listings}</p>
            <p className="flex items-center text-sm font-semibold text-green-600">+2% <span className="material-symbols-outlined text-sm">trending_up</span></p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Lịch hẹn chờ duyệt</p>
            <span className="material-symbols-outlined text-primary">schedule</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{metrics.pending}</p>
            <p className="flex items-center text-sm font-semibold text-green-600">+15% <span className="material-symbols-outlined text-sm">trending_up</span></p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Lịch đã phản hồi</p>
            <span className="material-symbols-outlined text-primary">mail</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{metrics.newMessages}</p>
            <p className="flex items-center text-sm font-semibold text-red-500">-5% <span className="material-symbols-outlined text-sm">trending_down</span></p>
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

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold">Tạo tin đăng mới</h3>
          <span className="text-sm text-slate-500">Dùng đúng API multipart hiện có</span>
        </div>
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={createRoom}>
          <input className="rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none" name="title" onChange={onChange} placeholder="Tiêu đề tin đăng" value={form.title} />
          <input className="rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none" name="price" onChange={onChange} placeholder="Giá thuê" value={form.price} />
          <input className="rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none" name="area" onChange={onChange} placeholder="Khu vực" value={form.area} />
          <input className="rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none" name="address" onChange={onChange} placeholder="Địa chỉ" value={form.address} />
          <textarea className="min-h-32 rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none md:col-span-2" name="description" onChange={onChange} placeholder="Mô tả chi tiết" value={form.description}></textarea>
          <input accept="image/*" className="rounded-lg border border-slate-200 px-4 py-3 text-sm md:col-span-2" multiple onChange={onImagesChange} type="file" />
          <div className="md:col-span-2">
            <button className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all shadow-sm shadow-primary/20 hover:bg-primary/90" type="submit">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Đăng tin mới
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default LandlordDashboardPage;
