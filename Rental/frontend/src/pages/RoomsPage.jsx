import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LoadingState from "@/components/common/LoadingState";
import Pagination from "@/components/common/Pagination";
import useAuth from "@/hooks/useAuth";
import landlordService from "@/services/LandlordService";
import roomService from "@/services/RoomService";
import { getApiData } from "@/utils/apiResponse";
import { subscribeToPublicCacheInvalidation } from "@/utils/publicCache";
import { normalizeRoomDetails, resolveRoomImageUrl } from "@/utils/roomDetails";

const quickAreas = ["Tất cả", "Quận 1", "Quận 3", "Quận 7", "Bình Thạnh", "Thủ Đức"];
const searchPlaceholderOptions = [
  "Quận 3, Bình Thạnh...",
  "Đường Nguyễn Trãi...",
  "Nguyễn Hữu Thọ, Quận 7...",
  "Studio gần RMIT...",
];

const RoomCard = ({ room, uploadBaseUrl }) => {
  const details = normalizeRoomDetails(room.details, room);
  const quickFacts = details.quickFacts || [];
  const amenities = details.amenities || [];
  const imageUrl = resolveRoomImageUrl(room.images?.[0]?.imageUrl || "", uploadBaseUrl);

  return (
    <Link to={`/rooms/${room.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-emerald-50 to-green-100">
          {imageUrl ? (
            <img
              alt={room.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              src={imageUrl}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-primary/25">home_work</span>
            </div>
          )}

          {details.badges?.[0]?.label ? (
            <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
              {details.badges[0].label}
            </span>
          ) : null}
        </div>

        <div className="p-4">
          <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span className="material-symbols-outlined text-sm">location_on</span>
            {room.address || "Đang cập nhật"}
          </div>

          <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-snug text-slate-900">{room.title}</h3>

          <div className="mb-3 flex flex-wrap gap-2">
            {[quickFacts[0]?.value, quickFacts[1]?.value, amenities[0]?.label].filter(Boolean).map((label, index) => (
              <span
                className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500"
                key={`${room.id}-info-${index}`}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <div>
              <span className="text-lg font-black text-primary" style={{ fontFamily: "var(--font-display)" }}>
                {Number(room.price || 0).toLocaleString("vi-VN")}
              </span>
              <span className="text-xs font-normal text-slate-400"> đ/tháng</span>
            </div>
            <span className="rounded-full bg-primary/8 px-3 py-1 text-xs font-bold text-primary">Xem chi tiết →</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const RoomsPage = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ minPrice: "", maxPrice: "", area: "" });
  const [activeQuickFilter, setActiveQuickFilter] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [searchInput, setSearchInput] = useState("");
  const [searchPlaceholder, setSearchPlaceholder] = useState(searchPlaceholderOptions[0]);

  const uploadBaseUrl = useMemo(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    return apiBaseUrl.replace(/\/api\/?$/, "");
  }, []);

  const loadRooms = useCallback(
    async (nextFilters = filters, options = {}) => {
      const { preferCache = true } = options;
      try {
        if (user?.role === "landlord") {
          setLoading(true);
          const response = await landlordService.getMyRooms();
          setRooms(getApiData(response, []));
          return;
        }

        const requestParams = {
          minPrice: nextFilters.minPrice || undefined,
          maxPrice: nextFilters.maxPrice || undefined,
          area: nextFilters.area || undefined,
          limit: 50,
        };
        const cachedPayload = preferCache ? roomService.getCachedRoomList(requestParams) : null;
        if (cachedPayload?.data) {
          setRooms(cachedPayload.data);
          setLoading(false);
        } else {
          setLoading(true);
        }

        const response = await roomService.listRooms(requestParams);
        const payload = getApiData(response, {});
        roomService.setCachedRoomList(requestParams, payload);
        setRooms(payload?.data || []);
      } catch {
        setRooms([]);
      } finally {
        setLoading(false);
      }
    },
    [filters, user?.role]
  );

  useEffect(() => {
    void loadRooms(filters);
  }, []);

  const isLandlord = user?.role === "landlord";

  useEffect(() => {
    if (isLandlord) return undefined;

    const unsubscribe = subscribeToPublicCacheInvalidation((detail) => {
      if (detail.scope === "rooms") {
        void loadRooms(filters, { preferCache: false });
      }
    });

    const handleFocus = () => {
      void loadRooms(filters, { preferCache: true });
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      unsubscribe();
      window.removeEventListener("focus", handleFocus);
    };
  }, [filters, isLandlord, loadRooms]);

  useEffect(() => {
    setSearchInput(filters.area || "");
  }, [filters.area]);

  useEffect(() => {
    let placeholderIndex = 0;
    const intervalId = setInterval(() => {
      placeholderIndex = (placeholderIndex + 1) % searchPlaceholderOptions.length;
      setSearchPlaceholder(searchPlaceholderOptions[placeholderIndex]);
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput === (filters.area || "")) return;
      const nextFilters = { ...filters, area: searchInput };
      setFilters(nextFilters);
      setCurrentPage(1);
      void loadRooms(nextFilters, { preferCache: false });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, loadRooms, searchInput]);

  const totalPages = Math.max(1, Math.ceil(rooms.length / pageSize));
  const paginatedRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return rooms.slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize, rooms]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleFilterChange = (event) => {
    setFilters((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handlePriceRangeChange = (event) => {
    const value = event.target.value;
    const [min, max] = value ? value.split("-") : ["", ""];
    const next = { ...filters, minPrice: min || "", maxPrice: max || "" };
    setFilters(next);
    setCurrentPage(1);
    void loadRooms(next, { preferCache: false });
  };

  const handleQuickFilterChange = (chip) => {
    setActiveQuickFilter(chip);
    const next = { ...filters, area: chip === "Tất cả" ? "" : chip };
    setFilters(next);
    setCurrentPage(1);
    void loadRooms(next, { preferCache: false });
  };

  const handleSubmit = () => {
    setCurrentPage(1);
    void loadRooms(filters, { preferCache: false });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
          {isLandlord ? "Bài đăng của tôi" : "Tìm nơi ở ưng ý"}
        </h1>
        <p className="mt-2 text-base text-slate-500">
          {isLandlord
            ? "Quản lý các bài đăng cho thuê của bạn một cách hiệu quả."
            : "Hàng nghìn lựa chọn phòng trọ, căn hộ dịch vụ cao cấp đang chờ đón bạn."}
        </p>
      </div>

      {!isLandlord ? (
        <div className="mb-10">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
              <div className="p-5 transition-colors hover:bg-slate-50/50 lg:col-span-4">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Khu vực / tuyến đường</label>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-300">location_on</span>
                  <input
                    className="w-full border-none bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-300 focus:ring-0"
                    name="area"
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder={searchPlaceholder}
                    type="text"
                    value={searchInput}
                  />
                </div>
              </div>

              <div className="p-5 transition-colors hover:bg-slate-50/50 lg:col-span-3">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Loại hình</label>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-300">home</span>
                  <select className="w-full cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none focus:ring-0">
                    <option>Tất cả loại</option>
                    <option>Phòng trọ</option>
                    <option>Căn hộ dịch vụ</option>
                    <option>Nhà nguyên căn</option>
                  </select>
                </div>
              </div>

              <div className="p-5 transition-colors hover:bg-slate-50/50 lg:col-span-3">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Ngân sách</label>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-300">payments</span>
                  <select
                    className="w-full cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none focus:ring-0"
                    onChange={handlePriceRangeChange}
                  >
                    <option value="">Linh hoạt</option>
                    <option value="0-2000000">Dưới 2 triệu</option>
                    <option value="2000000-4000000">2 – 4 triệu</option>
                    <option value="4000000-7000000">4 – 7 triệu</option>
                    <option value="7000000-">Trên 7 triệu</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center bg-slate-50/30 p-3 lg:col-span-2">
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition-all hover:bg-primary-dark hover:shadow-lg active:scale-[0.98]"
                  onClick={handleSubmit}
                  style={{ fontFamily: "var(--font-display)" }}
                  type="button"
                >
                  <span className="material-symbols-outlined text-xl">search</span>
                  <span className="lg:hidden xl:inline">Tìm kiếm</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="mr-1 text-xs font-bold uppercase tracking-widest text-slate-400">Phổ biến:</span>
            {quickAreas.map((chip) => (
              <button
                className={`rounded-full border px-5 py-2 text-xs font-bold transition-all ${
                  activeQuickFilter === chip
                    ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                    : "border-slate-200 bg-white text-slate-500 hover:border-primary hover:bg-primary/5 hover:text-primary"
                }`}
                key={chip}
                onClick={() => handleQuickFilterChange(chip)}
                type="button"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {!loading && rooms.length > 0 ? (
        <div className="mb-4 text-sm text-slate-500">
          Hiển thị <strong className="text-slate-700">{rooms.length}</strong> phòng
          {activeQuickFilter !== "Tất cả" ? <> tại <strong className="text-primary">{activeQuickFilter}</strong></> : null}
        </div>
      ) : null}

      {loading ? (
        <LoadingState variant="grid" count={6} />
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <span className="material-symbols-outlined text-4xl">search_off</span>
          </div>
          <h3 className="mb-1 text-base font-bold text-slate-700">Không tìm thấy phòng nào</h3>
          <p className="mb-4 text-sm text-slate-400">Hãy thử thay đổi bộ lọc hoặc khu vực khác.</p>
          <button
            className="rounded-full border border-primary bg-primary/5 px-5 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white"
            onClick={() => handleQuickFilterChange("Tất cả")}
            type="button"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedRooms.map((room) => (
              <RoomCard key={room.id} room={room} uploadBaseUrl={uploadBaseUrl} />
            ))}
          </div>

          <Pagination
            className="mt-8"
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(nextSize) => {
              setPageSize(nextSize);
              setCurrentPage(1);
            }}
            pageSize={pageSize}
            pageSizeOptions={[6, 9, 12]}
            totalItems={rooms.length}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
};

export default RoomsPage;
