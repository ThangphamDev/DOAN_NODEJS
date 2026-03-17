import { useEffect, useState } from "react";
import adminService from "@/services/AdminService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const ManageRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadReportedRooms = async () => {
    try {
      const response = await adminService.getReportedRooms();
      setRooms(getApiData(response, []));
      setError("");
    } catch (err) {
      setError(getApiMessage(err, "Không tải được danh sách tin vi phạm"));
      setSuccessMessage("");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initReportedRooms = async () => {
      try {
        const response = await adminService.getReportedRooms();
        if (!isMounted) return;
        setRooms(getApiData(response, []));
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setError(getApiMessage(err, "Không tải được danh sách tin vi phạm"));
        setSuccessMessage("");
      }
    };

    initReportedRooms();

    return () => {
      isMounted = false;
    };
  }, []);

  const deleteViolationRoom = async (roomId) => {
    try {
      await adminService.deleteRoom(roomId);
      setSuccessMessage("Đã xóa tin vi phạm.");
      setError("");
      await loadReportedRooms();
    } catch (err) {
      setError(getApiMessage(err, "Không thể xóa tin vi phạm"));
      setSuccessMessage("");
    }
  };

  return (
    <section>
      <h1>Tin đăng vi phạm</h1>
      {error && <p className="auth-error">{error}</p>}
      {successMessage && <p className="customer-success">{successMessage}</p>}

      {rooms.length === 0 ? (
        <p className="customer-note">Chưa có tin vi phạm cần xử lý.</p>
      ) : (
        <div className="customer-review-items">
          {rooms.map((room) => (
            <article key={room.id} className="customer-review-item">
              <div className="customer-review-top">
                <strong>{room.title}</strong>
                <span>Báo cáo: {room.reportedCount || 0}</span>
              </div>
              <p>{room.address}</p>
              <button
                type="button"
                className="auth-button"
                style={{ background: "#c0392b", marginTop: 10 }}
                onClick={() => deleteViolationRoom(room.id)}
              >
                Xóa tin vi phạm
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default ManageRoomsPage;
