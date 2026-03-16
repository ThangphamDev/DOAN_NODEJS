import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import roomService from "@/services/RoomService";
import LoadingState from "@/components/common/LoadingState";
import useAuth from "@/hooks/useAuth";

const RoomDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [review, setReview] = useState({ rating: 5, content: "" });

  const fetchRoom = () => {
    roomService.getRoomDetail(id).then(({ data }) => setRoom(data)).catch(() => {});
  };

  useEffect(() => {
    roomService.getRoomDetail(id).then(({ data }) => setRoom(data)).catch(() => {});
  }, [id]);

  const addFavorite = async () => {
    await roomService.toggleFavorite(id);
    alert("Đã cập nhật yêu thích");
  };

  const bookVisit = async () => {
    await roomService.createAppointment(id, { scheduledAt });
    alert("Đã gửi lịch xem phòng");
  };

  const submitReview = async () => {
    await roomService.createReview(id, review);
    fetchRoom();
    setReview({ rating: 5, content: "" });
  };

  if (!room) return <LoadingState />;

  return (
    <section>
      <h1>{room.title}</h1>
      <p>{room.address}</p>
      <p>{Number(room.price).toLocaleString()} VND</p>
      <p>{room.description}</p>

      {user?.role === "customer" && (
        <div className="panel">
          <button onClick={addFavorite}>Yêu thích</button>
          <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          <button onClick={bookVisit}>Đặt lịch xem</button>
        </div>
      )}

      <h2>Đánh giá</h2>
      <ul>
        {(room.reviews || []).map((item) => (
          <li key={item.id}>
            <strong>{item.reviewer?.fullName}</strong>: {item.rating}⭐ - {item.content}
          </li>
        ))}
      </ul>

      {user?.role === "customer" && (
        <div className="panel">
          <select
            value={review.rating}
            onChange={(e) => setReview((prev) => ({ ...prev, rating: Number(e.target.value) }))}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <option key={star} value={star}>
                {star} sao
              </option>
            ))}
          </select>
          <textarea
            value={review.content}
            onChange={(e) => setReview((prev) => ({ ...prev, content: e.target.value }))}
            placeholder="Nhận xét"
          />
          <button onClick={submitReview}>Gửi đánh giá</button>
        </div>
      )}
    </section>
  );
};

export default RoomDetailPage;
