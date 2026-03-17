import { useEffect, useMemo, useState } from "react";
import landlordService from "@/services/LandlordService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const ManageReviewsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const initRooms = async () => {
      try {
        const response = await landlordService.getMyRooms();
        if (!isMounted) return;
        setRooms(getApiData(response, []));
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setError(getApiMessage(err, "Không tải được đánh giá"));
      }
    };

    initRooms();

    return () => {
      isMounted = false;
    };
  }, []);

  const reviewCount = useMemo(() => {
    return rooms.reduce((total, room) => total + (room.reviews?.length || 0), 0);
  }, [rooms]);

  return (
    <section>
      <h1>Đánh giá của khách</h1>
      <p className="customer-note">Tổng số đánh giá: {reviewCount}</p>
      {error && <p className="auth-error">{error}</p>}

      {rooms.length === 0 ? (
        <p className="customer-note">Bạn chưa có phòng để hiển thị đánh giá.</p>
      ) : (
        <div className="customer-review-items">
          {rooms.map((room) => (
            <article key={room.id} className="customer-review-item">
              <div className="customer-review-top">
                <strong>{room.title}</strong>
                <span>{room.reviews?.length || 0} đánh giá</span>
              </div>

              {!room.reviews || room.reviews.length === 0 ? (
                <p className="customer-note">Chưa có đánh giá cho phòng này.</p>
              ) : (
                room.reviews.map((review) => (
                  <div key={review.id} style={{ borderTop: "1px solid #e5e7eb", paddingTop: 8, marginTop: 8 }}>
                    <p>
                      <strong>{review.reviewer?.fullName || "Khách"}</strong> - {review.rating}/5
                    </p>
                    <p>{review.content || "(Không có nội dung)"}</p>
                  </div>
                ))
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default ManageReviewsPage;
