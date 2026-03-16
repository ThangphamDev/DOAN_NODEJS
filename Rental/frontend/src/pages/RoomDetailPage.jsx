import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import roomService from "@/services/RoomService";
import LoadingState from "@/components/common/LoadingState";
import useAuth from "@/hooks/useAuth";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const RoomDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [review, setReview] = useState({ rating: 5, content: "" });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const uploadBaseUrl = useMemo(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    return apiBaseUrl.replace(/\/api\/?$/, "");
  }, []);

  const roomImages = useMemo(() => {
    const images = room?.images || [];
    return images.map((image) => {
      const imageUrl = image?.imageUrl || "";
      if (!imageUrl) return "";
      if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
      return `${uploadBaseUrl}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
    }).filter(Boolean);
  }, [room?.images, uploadBaseUrl]);

  const fetchRoom = useCallback(() => {
    roomService
      .getRoomDetail(id)
      .then((response) => {
        setRoom(getApiData(response));
        setError("");
      })
      .catch((err) => setError(getApiMessage(err, "Không tải được thông tin phòng")));
  }, [id]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  const addFavorite = async () => {
    try {
      await roomService.toggleFavorite(id);
      setSuccessMessage("Đã cập nhật danh sách yêu thích.");
      setError("");
    } catch (err) {
      setError(getApiMessage(err, "Không thể cập nhật yêu thích"));
      setSuccessMessage("");
    }
  };

  const bookVisit = async () => {
    if (!scheduledAt) {
      setError("Vui lòng chọn thời gian xem phòng");
      setSuccessMessage("");
      return;
    }

    try {
      await roomService.createAppointment(id, { scheduledAt });
      setSuccessMessage("Đã gửi lịch xem phòng thành công.");
      setError("");
      setScheduledAt("");
    } catch (err) {
      setError(getApiMessage(err, "Không thể đặt lịch xem phòng"));
      setSuccessMessage("");
    }
  };

  const submitReview = async () => {
    if (!review.content.trim()) {
      setError("Vui lòng nhập nội dung đánh giá");
      setSuccessMessage("");
      return;
    }

    try {
      await roomService.createReview(id, review);
      fetchRoom();
      setReview({ rating: 5, content: "" });
      setSuccessMessage("Đánh giá của bạn đã được ghi nhận.");
      setError("");
    } catch (err) {
      setError(getApiMessage(err, "Không thể gửi đánh giá"));
      setSuccessMessage("");
    }
  };

  if (!room) return <LoadingState />;

  return (
    <section className="customer-page customer-detail-page">
      <div className="customer-page__head">
        <h1>{room.title}</h1>
        <p>{room.address}</p>
      </div>

      <div className="customer-detail-grid">
        <article className="customer-card customer-detail-main">
          <div className="customer-detail-hero">
            {roomImages[0] ? (
              <img src={roomImages[0]} alt={room.title} />
            ) : (
              <div className="customer-detail-placeholder">Không có ảnh phòng</div>
            )}
          </div>

          {roomImages.length > 1 && (
            <div className="customer-detail-gallery">
              {roomImages.slice(1, 5).map((imageUrl, index) => (
                <img key={`${imageUrl}-${index}`} src={imageUrl} alt={`${room.title}-${index + 2}`} />
              ))}
            </div>
          )}

          <div className="customer-detail-content">
            <div className="customer-price-row">
              <strong>{Number(room.price).toLocaleString()} VND</strong>
              <span>{room.area}</span>
            </div>
            <p>{room.description || "Chủ trọ chưa cập nhật mô tả chi tiết cho phòng này."}</p>
          </div>
        </article>

        <aside className="customer-card customer-detail-actions">
          <h3>Thao tác nhanh</h3>
          <p>Thực hiện yêu thích hoặc đặt lịch xem trực tiếp tại đây.</p>

          {error && <p className="auth-error">{error}</p>}
          {successMessage && <p className="customer-success">{successMessage}</p>}

          {user?.role === "customer" ? (
            <div className="customer-form-stack">
              <button type="button" className="auth-button" onClick={addFavorite}>
                Thêm vào yêu thích
              </button>
              <label className="auth-label">
                <span>Thời gian xem phòng</span>
                <input
                  className="auth-input"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </label>
              <button type="button" className="auth-button" onClick={bookVisit}>
                Đặt lịch xem phòng
              </button>
            </div>
          ) : (
            <p className="customer-note">Đăng nhập bằng tài khoản khách hàng để đặt lịch và đánh giá phòng.</p>
          )}
        </aside>
      </div>

      <article className="customer-card customer-review-list">
        <div className="customer-section-head">
          <h2>Đánh giá từ người thuê</h2>
          <span>{(room.reviews || []).length} đánh giá</span>
        </div>

        {(room.reviews || []).length === 0 ? (
          <p className="customer-note">Chưa có đánh giá nào cho phòng này.</p>
        ) : (
          <div className="customer-review-items">
            {(room.reviews || []).map((item) => (
              <article key={item.id} className="customer-review-item">
                <div className="customer-review-top">
                  <strong>{item.reviewer?.fullName || "Khách thuê"}</strong>
                  <span>{item.rating}/5</span>
                </div>
                <p>{item.content || "(Không có nội dung)"}</p>
              </article>
            ))}
          </div>
        )}
      </article>

      {user?.role === "customer" && (
        <article className="customer-card customer-review-form">
          <h3>Viết đánh giá</h3>
          <div className="customer-form-stack">
            <label className="auth-label">
              <span>Chấm điểm</span>
              <select
                className="auth-select"
                value={review.rating}
                onChange={(e) => setReview((prev) => ({ ...prev, rating: Number(e.target.value) }))}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <option key={star} value={star}>
                    {star} / 5
                  </option>
                ))}
              </select>
            </label>

            <label className="auth-label">
              <span>Nhận xét</span>
              <textarea
                className="auth-input customer-textarea"
                value={review.content}
                onChange={(e) => setReview((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Chia sẻ trải nghiệm thực tế của bạn"
              />
            </label>

            <button type="button" className="auth-button" onClick={submitReview}>
              Gửi đánh giá
            </button>
          </div>
        </article>
      )}
    </section>
  );
};

export default RoomDetailPage;
