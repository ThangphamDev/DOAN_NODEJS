import { useEffect, useState } from "react";
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
    let isMounted = true;

    const initAppointments = async () => {
      try {
        const response = await landlordService.getAppointments();
        if (!isMounted) return;
        setAppointments(getApiData(response, []));
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setError(getApiMessage(err, "Không tải được lịch xem phòng"));
        setSuccessMessage("");
      }
    };

    initAppointments();

    return () => {
      isMounted = false;
    };
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

  return (
    <section>
      <h1>Lịch xem phòng</h1>
      {error && <p className="auth-error">{error}</p>}
      {successMessage && <p className="customer-success">{successMessage}</p>}

      <div className="customer-review-items">
        {appointments.length === 0 ? (
          <p className="customer-note">Chưa có lịch hẹn nào.</p>
        ) : (
          appointments.map((item) => (
            <article key={item.id} className="customer-review-item">
              <div className="customer-review-top">
                <strong>{item.room?.title || "Phòng"}</strong>
                <span>{item.status}</span>
              </div>
              <p>Khách đặt: {item.customer?.fullName || "Ẩn danh"}</p>
              <p>Thời gian: {item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : "Chưa rõ"}</p>
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button type="button" className="auth-button" onClick={() => updateStatus(item.id, "approved")}>
                  Duyệt
                </button>
                <button
                  type="button"
                  className="auth-button"
                  style={{ background: "#c0392b" }}
                  onClick={() => updateStatus(item.id, "rejected")}
                >
                  Từ chối
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default ManageAppointmentsPage;
