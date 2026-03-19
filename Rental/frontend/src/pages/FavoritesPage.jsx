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

  const handleRemove = async (roomId) => {
    try {
      await roomService.toggleFavorite(roomId);
      setFavorites((prev) => prev.filter((item) => Number(item.room?.id) !== Number(roomId)));
    } catch (err) {
      setError(getApiMessage(err, "Không thể cập nhật danh sách yêu thích"));
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <section className="page-section">
      <div className="mb-6">
        <h1>Phòng yêu thích</h1>
        <p className="text-sm text-slate-500">Lưu lại những phòng bạn quan tâm để xem lại nhanh hơn.</p>
      </div>

      {error ? <div className="card text-sm text-rose-600">{error}</div> : null}

      <div className="card-list">
        {favorites.length === 0 ? (
          <div className="card">
            <p className="text-sm text-slate-500">Bạn chưa lưu phòng nào vào danh sách yêu thích.</p>
          </div>
        ) : (
          favorites.map((item) => {
            const room = item.room;
            const imageUrl = resolveRoomImageUrl(room?.images?.[0]?.imageUrl || "", uploadBaseUrl);

            return (
              <article className="card" key={item.id}>
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="h-40 w-full overflow-hidden rounded-xl bg-slate-100 md:w-56">
                    {imageUrl ? (
                      <img className="h-full w-full object-cover" src={imageUrl} alt={room?.title || "Phòng yêu thích"} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl">home_work</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{room?.title || "Phòng đang cập nhật"}</h2>
                      <p className="mt-2 text-sm text-slate-500">{room?.address || "Chưa có địa chỉ"}</p>
                      <p className="mt-2 text-lg font-bold text-primary">{Number(room?.price || 0).toLocaleString("vi-VN")} đ/tháng</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {room?.id ? (
                        <Link className="btn-primary" to={`/rooms/${room.id}`}>
                          Xem chi tiết
                        </Link>
                      ) : null}
                      {room?.id ? (
                        <button className="btn-ghost" type="button" onClick={() => handleRemove(room.id)}>
                          Bỏ yêu thích
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};

export default FavoritesPage;
