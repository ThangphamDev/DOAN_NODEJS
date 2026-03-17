import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import roomService from "@/services/RoomService";
import chatService from "@/services/ChatService";
import LoadingState from "@/components/common/LoadingState";
import useAuth from "@/hooks/useAuth";
import { getApiData, getApiMessage } from "@/utils/apiResponse";
import { getToken } from "@/utils/storage";

const RoomDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [review, setReview] = useState({ rating: 5, content: "" });
  const [chatContent, setChatContent] = useState("");
  const [showChatComposer, setShowChatComposer] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const socket = useMemo(() => {
    const token = getToken();
    if (!token) return null;
    return io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
    });
  }, []);

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

  useEffect(() => {
    if (!socket || !showChatComposer || !room?.landlord?.id) return;

    socket.on("chat:new", (message) => {
      const isWithCurrentLandlord =
        (message.senderId === room.landlord.id && message.receiverId === user?.id) ||
        (message.senderId === user?.id && message.receiverId === room.landlord.id);

      if (!isWithCurrentLandlord) {
        return;
      }

      if (message.roomId && Number(message.roomId) !== Number(room.id)) {
        return;
      }

      setChatMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("chat:new");
    };
  }, [socket, showChatComposer, room?.landlord?.id, room?.id, user?.id]);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

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

  const sendMessageToLandlord = async () => {
    if (!room?.landlord?.id) {
      setError("Không xác định được chủ trọ của phòng này");
      setSuccessMessage("");
      return;
    }

    if (!chatContent.trim()) {
      setError("Vui lòng nhập nội dung tin nhắn");
      setSuccessMessage("");
      return;
    }

    try {
      await chatService.sendMessage({
        receiverId: room.landlord.id,
        roomId: room.id,
        content: chatContent.trim(),
      });
      setChatContent("");
      setError("");
      setSuccessMessage("Đã gửi tin nhắn cho chủ trọ.");
    } catch (err) {
      setError(getApiMessage(err, "Không thể gửi tin nhắn"));
      setSuccessMessage("");
    }
  };

  const loadRoomConversation = async () => {
    if (!room?.landlord?.id) return;

    try {
      setChatLoading(true);
      const response = await chatService.getConversation(room.landlord.id, room.id);
      setChatMessages(getApiData(response, []));
      setError("");
    } catch (err) {
      setError(getApiMessage(err, "Không tải được lịch sử tin nhắn"));
    } finally {
      setChatLoading(false);
    }
  };

  const openChatPopup = async () => {
    setShowChatComposer(true);
    await loadRoomConversation();
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
          {room.landlord?.fullName && (
            <p className="customer-note">Chủ trọ: {room.landlord.fullName}</p>
          )}

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
              <button
                type="button"
                className="auth-button"
                onClick={openChatPopup}
              >
                Nhắn tin với chủ trọ
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

      {showChatComposer && (
        <div className="customer-chat-modal__overlay" onClick={() => setShowChatComposer(false)}>
          <div className="customer-chat-modal" onClick={(event) => event.stopPropagation()}>
            <div className="customer-chat-modal__head">
              <h3>Nhắn tin với {room.landlord?.fullName || "chủ trọ"}</h3>
              <button type="button" className="auth-button" onClick={() => setShowChatComposer(false)}>
                Đóng
              </button>
            </div>

            <div className="customer-chat-modal__messages">
              {chatLoading ? (
                <p className="customer-note">Đang tải hội thoại...</p>
              ) : chatMessages.length === 0 ? (
                <p className="customer-note">Chưa có tin nhắn nào trong phòng này.</p>
              ) : (
                chatMessages.map((item) => (
                  <div
                    key={item.id}
                    className={`customer-chat-bubble ${item.senderId === user?.id ? "customer-chat-bubble--mine" : "customer-chat-bubble--other"}`}
                  >
                    <div className="customer-chat-bubble__meta">
                      <strong>{item.senderId === user?.id ? "Bạn" : room.landlord?.fullName || "Chủ trọ"}</strong>
                      <span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : "Vừa xong"}</span>
                    </div>
                    <p>{item.content}</p>
                  </div>
                ))
              )}
            </div>

            <div className="customer-chat-compose">
              <textarea
                className="auth-input customer-textarea"
                value={chatContent}
                onChange={(e) => setChatContent(e.target.value)}
                placeholder="Nhập tin nhắn gửi chủ trọ"
              />
              <button type="button" className="auth-button" onClick={sendMessageToLandlord}>
                Gửi tin nhắn
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RoomDetailPage;
