import { useEffect, useState } from "react";
import landlordService from "@/services/LandlordService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const DashboardPage = () => {
  const [form, setForm] = useState({ title: "", price: "", area: "", address: "", description: "", images: [] });
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");

  const loadAppointments = () => {
    landlordService
      .getAppointments()
      .then((response) => setAppointments(getApiData(response, [])))
      .catch((err) => setError(getApiMessage(err, "Không tải được lịch hẹn")));
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onImagesChange = (e) => {
    setForm((prev) => ({ ...prev, images: Array.from(e.target.files || []) }));
  };

  const createRoom = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.area || !form.address) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setError("");
      await landlordService.createRoom(form);
      setForm({ title: "", price: "", area: "", address: "", description: "", images: [] });
      alert("Đăng tin thành công");
    } catch (err) {
      setError(getApiMessage(err, "Không thể đăng tin"));
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setError("");
      await landlordService.updateAppointmentStatus(id, status);
      loadAppointments();
    } catch (err) {
      setError(getApiMessage(err, "Không thể cập nhật trạng thái lịch hẹn"));
    }
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
        <input type="file" multiple accept="image/*" onChange={onImagesChange} />
        {error && <p className="error">{error}</p>}
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
