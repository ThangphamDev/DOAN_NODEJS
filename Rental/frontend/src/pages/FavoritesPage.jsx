import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LoadingState from "@/components/common/LoadingState";
import roomService from "@/services/RoomService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";
import { resolveRoomImageUrl } from "@/utils/roomDetails";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const uploadBaseUrl = useMemo(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    return apiBaseUrl.replace(/\/api\/?$/, "");
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadFavorites = async () => {
      try {
        const response = await roomService.getMyFavorites();
        if (!isMounted) return;
        setFavorites(getApiData(response, []));
      } catch (err) {
        if (!isMounted) return;
        setError(getApiMessage(err, "Không tải được danh sách yêu thích"));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadFavorites();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRemoveConfirm = (roomId) => {
    setConfirmId(roomId);
  };

  const handleRemoveCancel = () => {
    setConfirmId(null);
  };

  const handleRemove = async (roomId) => {
    setConfirmId(null);
    setRemovingId(roomId);
    try {
      await roomService.toggleFavorite(roomId);
      setFavorites((prev) => prev.filter((item) => Number(item.room?.id) !== Number(roomId)));
    } catch (err) {
      setError(getApiMessage(err, "Không thể cập nhật danh sách yêu thích"));
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-section">
        <div className="mb-8">
          <div className="h-8 w-48 rounded-lg bg-slate-200 animate-pulse" />
          <div className="mt-2 h-4 w-72 rounded bg-slate-200 animate-pulse" />
        </div>
        <LoadingState variant="list" count={4} />
      </div>
    );
  }

  return (
    <section className="page-section">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Phòng yêu thích
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {favorites.length > 0 ? `${favorites.length} phòng đã lưu` : "Lưu phòng bạn quan tâm để xem lại nhanh hơn."}
          </p>
        </div>
        {favorites.length > 0 ? (
          <Link
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-primary hover:text-primary"
            to="/rooms"
          >
            <span className="material-symbols-outlined text-base">travel_explore</span>
            Tìm thêm phòng
          </Link>
        ) : null}
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {/* Confirm dialog */}
      {confirmId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 shadow-xl">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <span className="material-symbols-outlined">favorite_border</span>
            </div>
            <h3 className="mb-2 text-base font-bold text-slate-900">Bỏ yêu thích?</h3>
            <p className="mb-6 text-sm text-slate-500">Phòng này sẽ bị xoá khỏi danh sách phòng yêu thích của bạn.</p>
            <div className="flex gap-3">
              <button
                className="flex-1 rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                type="button"
                onClick={handleRemoveCancel}
              >
                Huỷ
              </button>
              <button
                className="flex-1 rounded-full bg-rose-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
                type="button"
                onClick={() => handleRemove(confirmId)}
              >
                Xoá khỏi yêu thích
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Empty state */}
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <span className="material-symbols-outlined text-4xl">favorite_border</span>
          </div>
          <h3 className="mb-1 text-base font-bold text-slate-700">Chưa có phòng yêu thích</h3>
          <p className="mb-6 text-sm text-slate-400">Nhấn tim trên các phòng bạn thích để lưu lại ở đây.</p>
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
            to="/rooms"
          >
            Khám phá phòng ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {favorites.map((item) => {
            const room = item.room;
            const imageUrl = resolveRoomImageUrl(room?.images?.[0]?.imageUrl || "", uploadBaseUrl);
            const isRemoving = Number(removingId) === Number(room?.id);

            return (
              <article
                className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${
                  isRemoving ? "opacity-50 pointer-events-none" : "border-slate-200 hover:border-slate-300"
                }`}
                key={item.id}
              >
                <div className="flex flex-col gap-0 md:flex-row">
                  {/* Image */}
                  <div className="relative h-48 w-full shrink-0 overflow-hidden md:h-auto md:w-56">
                    {imageUrl ? (
                      <img
                        alt={room?.title || "Phòng yêu thích"}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        src={imageUrl}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-light to-green-100">
                        <span className="material-symbols-outlined text-5xl text-primary/40">home_work</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                    <div>
                      <h2 className="mb-1 text-lg font-bold text-slate-900">{room?.title || "Phòng đang cập nhật"}</h2>
                      <p className="flex items-center gap-1.5 text-sm text-slate-500">
                        <span className="material-symbols-outlined text-base text-slate-400">location_on</span>
                        {room?.address || "Chưa có địa chỉ"}
                      </p>
                      <p className="mt-3 text-xl font-black text-primary" style={{ fontFamily: "var(--font-display)" }}>
                        {Number(room?.price || 0).toLocaleString("vi-VN")}
                        <span className="text-sm font-normal text-slate-400"> đ/tháng</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {room?.id ? (
                        <Link
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
                          to={`/rooms/${room.id}`}
                        >
                          <span className="material-symbols-outlined text-base">open_in_new</span>
                          Xem chi tiết
                        </Link>
                      ) : null}
                      {room?.id ? (
                        <button
                          className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-50"
                          disabled={isRemoving}
                          type="button"
                          onClick={() => handleRemoveConfirm(room.id)}
                        >
                          <span className="material-symbols-outlined text-base">heart_minus</span>
                          Bỏ yêu thích
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default FavoritesPage;
