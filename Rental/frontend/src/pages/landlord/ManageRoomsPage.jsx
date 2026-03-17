import { useEffect, useState } from "react";
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

const ManageRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [statusByRoom, setStatusByRoom] = useState({});
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadMyRooms = async () => {
    try {
      const response = await landlordService.getMyRooms();
      const roomList = getApiData(response, []);
      setRooms(roomList);
      const nextStatus = roomList.reduce((acc, room) => {
        acc[room.id] = room.status || "active";
        return acc;
      }, {});
      setStatusByRoom(nextStatus);
      setError("");
    } catch (err) {
      setError(getApiMessage(err, "Không tải được danh sách phòng của bạn"));
      setSuccessMessage("");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initRooms = async () => {
      try {
        const response = await landlordService.getMyRooms();
        if (!isMounted) return;

        const roomList = getApiData(response, []);
        setRooms(roomList);
        const nextStatus = roomList.reduce((acc, room) => {
          acc[room.id] = room.status || "active";
          return acc;
        }, {});
        setStatusByRoom(nextStatus);
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setError(getApiMessage(err, "Không tải được danh sách phòng của bạn"));
        setSuccessMessage("");
      }
    };

    initRooms();

    return () => {
      isMounted = false;
    };
  }, []);

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
      setSuccessMessage("Đăng tin thành công.");
      setError("");
      await loadMyRooms();
    } catch (err) {
      setError(getApiMessage(err, "Không thể đăng tin mới"));
      setSuccessMessage("");
    }
  };

  const updateStatus = async (roomId) => {
    try {
      await landlordService.updateRoom(roomId, { status: statusByRoom[roomId] || "active" });
      setSuccessMessage("Đã cập nhật trạng thái tin.");
      setError("");
      await loadMyRooms();
    } catch (err) {
      setError(getApiMessage(err, "Không thể cập nhật trạng thái"));
      setSuccessMessage("");
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      await landlordService.deleteRoom(roomId);
      setSuccessMessage("Đã xóa tin phòng.");
      setError("");
      await loadMyRooms();
    } catch (err) {
      setError(getApiMessage(err, "Không thể xóa tin"));
      setSuccessMessage("");
    }
  };

  return (
    <section>
      <h1>Đăng tin & Quản lý tin</h1>
      {error && <p className="auth-error">{error}</p>}
      {successMessage && <p className="customer-success">{successMessage}</p>}

      <article className="customer-card" style={{ marginBottom: 20 }}>
        <h2>Đăng tin mới</h2>
        <form onSubmit={createRoom} className="customer-form-stack">
          <input className="auth-input" name="title" placeholder="Tiêu đề" value={form.title} onChange={onChange} />
          <input className="auth-input" name="price" placeholder="Giá" value={form.price} onChange={onChange} />
          <input className="auth-input" name="area" placeholder="Khu vực" value={form.area} onChange={onChange} />
          <input className="auth-input" name="address" placeholder="Địa chỉ" value={form.address} onChange={onChange} />
          <textarea
            className="auth-input customer-textarea"
            name="description"
            placeholder="Mô tả"
            value={form.description}
            onChange={onChange}
          />
          <input className="auth-input" type="file" multiple accept="image/*" onChange={onImagesChange} />
          <button type="submit" className="auth-button">Đăng tin</button>
        </form>
      </article>

      <article className="customer-card">
        <h2>Tin đã đăng</h2>
        {rooms.length === 0 ? (
          <p className="customer-note">Bạn chưa có tin đăng nào.</p>
        ) : (
          <div className="customer-review-items">
            {rooms.map((room) => (
              <article key={room.id} className="customer-review-item">
                <div className="customer-review-top">
                  <strong>{room.title}</strong>
                  <span>{Number(room.price || 0).toLocaleString()} VND</span>
                </div>
                <p>{room.address}</p>
                <div className="customer-form-stack" style={{ marginTop: 10 }}>
                  <select
                    className="auth-select"
                    value={statusByRoom[room.id] || "active"}
                    onChange={(event) => {
                      const value = event.target.value;
                      setStatusByRoom((prev) => ({ ...prev, [room.id]: value }));
                    }}
                  >
                    <option value="active">Hiển thị</option>
                    <option value="hidden">Ẩn</option>
                    <option value="rented">Đã cho thuê</option>
                  </select>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="button" className="auth-button" onClick={() => updateStatus(room.id)}>
                      Lưu trạng thái
                    </button>
                    <button
                      type="button"
                      className="auth-button"
                      onClick={() => deleteRoom(room.id)}
                      style={{ background: "#c0392b" }}
                    >
                      Xóa tin
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </article>
    </section>
  );
};

export default ManageRoomsPage;
