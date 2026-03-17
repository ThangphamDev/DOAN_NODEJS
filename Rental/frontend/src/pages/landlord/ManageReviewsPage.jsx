import { useEffect, useMemo, useState } from "react";
import landlordService from "@/services/LandlordService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const ManageReviewsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const response = await landlordService.getMyRooms();
        setRooms(getApiData(response, []));
        setError("");
      } catch (err) {
        setError(getApiMessage(err, "Không tải được đánh giá"));
      }
    };

    loadRooms();
  }, []);

  const reviewItems = useMemo(
    () =>
      rooms
        .flatMap((room) =>
          (room.reviews || []).map((review) => ({
            ...review,
            roomId: room.id,
            roomTitle: room.title,
            roomArea: room.area,
          }))
        )
        .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0)),
    [rooms]
  );

  const summary = useMemo(() => {
    const reviewCount = reviewItems.length;
    const totalScore = reviewItems.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    const distribution = [5, 4, 3, 2, 1].map((star) => {
      const count = reviewItems.filter((review) => Number(review.rating) === star).length;
      return {
        star,
        count,
        percent: reviewCount ? Math.round((count / reviewCount) * 100) : 0,
      };
    });

    return {
      reviewCount,
      average: reviewCount ? (totalScore / reviewCount).toFixed(1) : "0.0",
      roomsWithReviews: rooms.filter((room) => room.reviews?.length).length,
      distribution,
    };
  }, [reviewItems, rooms]);

  const filteredReviews = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    return reviewItems.filter((review) => {
      const matchesTab =
        activeTab === "all" ? true : activeTab === "positive" ? Number(review.rating || 0) >= 4 : Number(review.rating || 0) <= 3;
      const haystack = `${review.reviewer?.fullName || ""} ${review.roomTitle || ""} ${review.content || ""}`.toLowerCase();
      const matchesSearch = !normalized || haystack.includes(normalized);
      return matchesTab && matchesSearch;
    });
  }, [reviewItems, activeTab, searchQuery]);

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, index) => (
      <span className="material-symbols-outlined !text-sm" key={`${rating}-${index}`}>
        {index < Number(rating || 0) ? "star" : "star_outline"}
      </span>
    ));

  const getReviewBadge = (rating) =>
    Number(rating || 0) >= 4
      ? { label: "Tích cực", className: "bg-green-100 text-green-600" }
      : { label: "Cần chú ý", className: "bg-red-100 text-red-600" };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Quản lý đánh giá</h2>
          <p className="text-slate-500">Áp dụng bố cục `review manager.html`, giữ toàn bộ dữ liệu đánh giá thật theo từng phòng.</p>
        </div>
        <label className="relative w-full max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            className="w-full rounded-lg bg-slate-100 py-2 pl-10 pr-4 text-sm border-none focus:ring-2 focus:ring-primary/40"
            placeholder="Tìm kiếm đánh giá..."
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
      </div>

      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Trung bình sao</p>
              <h3 className="mt-1 text-4xl font-black">{summary.average}</h3>
            </div>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <span className="material-symbols-outlined">hotel_class</span>
            </div>
          </div>
          <div className="flex gap-1 text-primary">{renderStars(Math.round(Number(summary.average || 0)))}</div>
          <p className="text-sm italic text-slate-500">Dựa trên {summary.reviewCount} lượt đánh giá</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 md:col-span-2">
          <p className="mb-4 text-sm font-medium text-slate-500">Phân bố xếp hạng</p>
          <div className="space-y-2">
            {summary.distribution.map((item) => (
              <div className="grid grid-cols-[24px_1fr_40px] items-center gap-4" key={item.star}>
                <span className="text-sm font-medium">{item.star}</span>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-primary" style={{ width: `${item.percent}%` }}></div>
                </div>
                <span className="text-right text-xs text-slate-500">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200">
        <div className="flex gap-8">
          <button className={`pb-4 text-sm ${activeTab === "all" ? "border-b-2 border-primary font-bold text-primary" : "border-b-2 border-transparent font-medium text-slate-500 hover:text-slate-800"}`} type="button" onClick={() => setActiveTab("all")}>Tất cả</button>
          <button className={`pb-4 text-sm ${activeTab === "positive" ? "border-b-2 border-primary font-bold text-primary" : "border-b-2 border-transparent font-medium text-slate-500 hover:text-slate-800"}`} type="button" onClick={() => setActiveTab("positive")}>Từ 4 sao</button>
          <button className={`pb-4 text-sm ${activeTab === "attention" ? "border-b-2 border-primary font-bold text-primary" : "border-b-2 border-transparent font-medium text-slate-500 hover:text-slate-800"}`} type="button" onClick={() => setActiveTab("attention")}>Cần chú ý</button>
        </div>
        <div className="pb-4">
          <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">{summary.roomsWithReviews} phòng có review</span>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">Chưa có đánh giá phù hợp với bộ lọc hiện tại.</div>
        ) : (
          filteredReviews.map((review) => {
            const badge = getReviewBadge(review.rating);
            return (
              <div className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-md" key={review.id}>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 font-bold text-primary">
                      {(review.reviewer?.fullName || "K").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold">{review.reviewer?.fullName || "Khách thuê"}</h4>
                      <div className="mt-0.5 flex items-center gap-2">
                        <div className="flex text-amber-400">{renderStars(review.rating)}</div>
                        <span className="text-xs text-slate-400">{review.roomTitle} {review.createdAt ? `• ${new Date(review.createdAt).toLocaleDateString("vi-VN")}` : ""}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${badge.className}`}>{badge.label}</span>
                </div>

                <p className="mb-6 text-sm leading-relaxed text-slate-700">{review.content || "(Không có nội dung)"}</p>

                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-primary">Thông tin liên quan</span>
                    <span className="text-[10px] text-slate-400">Phòng #{review.roomId}</span>
                  </div>
                  <p className="text-sm italic text-slate-500">
                    {Number(review.rating || 0) >= 4
                      ? `Phản hồi tốt cho ${review.roomTitle}. Có thể dùng làm điểm mạnh khi tư vấn các khách khác.`
                      : `Review này đang cần theo dõi thêm cho ${review.roomTitle}. Ưu tiên kiểm tra trải nghiệm thực tế của khách.`}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>{review.roomArea || "Đang cập nhật khu vực"}</span>
                    <a className="font-semibold text-primary hover:underline" href={`/rooms/${review.roomId}`} target="_blank" rel="noreferrer">Xem tin đăng</a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ManageReviewsPage;
