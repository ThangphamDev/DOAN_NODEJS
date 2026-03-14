import { useEffect, useState } from "react";
import landlordService from "@/services/LandlordService";

const DashboardPage = () => {
  const [form, setForm] = useState({ title: "", price: "", area: "", address: "", description: "" });
  const [appointments, setAppointments] = useState([]);

  const loadAppointments = async () => {
    const { data } = await landlordService.getAppointments();
    setAppointments(data);
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const createRoom = async (e) => {
    e.preventDefault();
    await landlordService.createRoom(form);
    setForm({ title: "", price: "", area: "", address: "", description: "" });
    alert("Đăng tin thành công");
  };

  const updateStatus = async (id, status) => {
    await landlordService.updateAppointmentStatus(id, status);
    loadAppointments();
  };

  return (
    <section>
      <h1>Trang chủ trọ</h1>
      <form onSubmit={createRoom} className="form">
        <input name="title" placeholder="Tiêu đề" value={form.title} onChange={onChange} required />
        <input name="price" placeholder="Giá" value={form.price} onChange={onChange} required />
        <input name="area" placeholder="Khu vực" value={form.area} onChange={onChange} required />
        <input name="address" placeholder="Địa chỉ" value={form.address} onChange={onChange} required />
        <textarea name="description" placeholder="Mô tả" value={form.description} onChange={onChange} />
        <button type="submit">Đăng tin mới</button>
      </form>

      <h2>Lịch hẹn xem phòng</h2>
      <div className="card-list">
        {appointments.map((item) => (
          <article className="card" key={item.id}>
            <p>{item.room?.title}</p>
            <p>{new Date(item.scheduledAt).toLocaleString()}</p>
            <p>Khách: {item.customer?.fullName}</p>
            <p>Trạng thái: {item.status}</p>
            <button onClick={() => updateStatus(item.id, "approved")}>Duyệt</button>
            <button onClick={() => updateStatus(item.id, "rejected")}>Từ chối</button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default DashboardPage;
