import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/common/Pagination";
import LandlordSearchInput from "@/components/landlord/LandlordSearchInput";
import LandlordToolbar from "@/components/landlord/LandlordToolbar";
import { useNotify } from "@/context/NotifyContext.jsx";
import landlordService from "@/services/LandlordService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const DEFAULT_PAGE_SIZE = 5;

const tabClassName = (isActive) =>
  `rounded-xl px-4 py-2 text-sm font-semibold transition ${
    isActive ? "bg-primary text-white shadow-sm shadow-primary/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
  }`;

const ManageReviewsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [replyText, setReplyText] = useState({});
  const notify = useNotify();

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const response = await landlordService.getMyRooms();
        setRooms(getApiData(response, []));
      } catch (err) {
        notify.error(getApiMessage(err, "Không tải được đánh giá"));
      }
    };

    loadRooms();
  }, [notify]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, pageSize, searchQuery]);

  const handleReplySubmit = async (reviewId) => {
    const content = replyText[reviewId]?.trim();
    if (!content) {
      notify.warning("Vui lòng nhập nội dung phản hồi");
      return;
    }

    try {
      await landlordService.replyReview(reviewId, content);
      notify.success("Đã gửi phản hồi đánh giá.");
      setRooms((prevRooms) =>
        prevRooms.map((room) => ({
          ...room,
          reviews: room.reviews?.map((review) => (review.id === reviewId ? { ...review, landlordReply: content } : review)),
        }))
      );
      setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
    } catch (err) {
      notify.error(getApiMessage(err, "Không thể gửi câu trả lời"));
    }
  };

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
      return matchesTab && (!normalized || haystack.includes(normalized));
    });
  }, [activeTab, reviewItems, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize));
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReviews.slice(start, start + pageSize);
  }, [currentPage, filteredReviews, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, index) => {
      const filled = index < Number(rating || 0);
      return (
        <span
          className={`material-symbols-outlined !text-sm ${filled ? "text-amber-400" : "text-slate-300"}`}
          key={`${rating}-${index}`}
        >
          star
        </span>
      );
    });

  const getReviewBadge = (rating) =>
    Number(rating || 0) >= 4
      ? { label: "Tích cực", className: "bg-green-100 text-green-600" }
      : { label: "Cần chú ý", className: "bg-red-100 text-red-600" };

  return (
    <div className="flex w-full flex-col gap-8">
      <LandlordToolbar>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button className={tabClassName(activeTab === "all")} type="button" onClick={() => setActiveTab("all")}>
              Tất cả
            </button>
            <button className={tabClassName(activeTab === "positive")} type="button" onClick={() => setActiveTab("positive")}>
              Từ 4 sao
            </button>
            <button className={tabClassName(activeTab === "attention")} type="button" onClick={() => setActiveTab("attention")}>
              Cần chú ý
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <LandlordSearchInput
              className="min-w-0 sm:w-80"
              placeholder="Tìm kiếm đánh giá..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
              {summary.roomsWithReviews} phòng có review
            </div>
          </div>
        </div>
      </LandlordToolbar>

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
          <div className="flex gap-1">{renderStars(Math.round(Number(summary.average || 0)))}</div>
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

      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            Chưa có đánh giá phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          paginatedReviews.map((review) => {
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
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-xs text-slate-400">
                          {review.roomTitle} {review.createdAt ? `- ${new Date(review.createdAt).toLocaleDateString("vi-VN")}` : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${badge.className}`}>{badge.label}</span>
                </div>

                <p className="mb-6 text-sm leading-relaxed text-slate-700">{review.content || "(Không có nội dung)"}</p>

                {review.landlordReply ? (
                  <div className="mb-6 rounded-lg border-l-4 border-primary bg-primary/5 p-4 pl-5">
                    <p className="mb-1 text-xs font-bold text-primary">Chủ trọ phản hồi:</p>
                    <p className="text-sm text-slate-700">{review.landlordReply}</p>
                  </div>
                ) : (
                  <div className="mb-6 flex items-start gap-3">
                    <div className="flex-1">
                      <textarea
                        className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        onChange={(event) => setReplyText((prev) => ({ ...prev, [review.id]: event.target.value }))}
                        placeholder="Viết câu trả lời cho đánh giá này..."
                        rows="2"
                        value={replyText[review.id] || ""}
                      />
                    </div>
                    <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90" onClick={() => handleReplySubmit(review.id)} type="button">
                      Gửi
                    </button>
                  </div>
                )}

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
                    <a className="font-semibold text-primary hover:underline" href={`/rooms/${review.roomId}`} target="_blank" rel="noreferrer">
                      Xem tin đăng
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalItems={filteredReviews.length}
      />
    </div>
  );
};

export default ManageReviewsPage;
