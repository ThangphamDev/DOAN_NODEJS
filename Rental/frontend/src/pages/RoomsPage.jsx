import { useCallback, useEffect, useState } from "react";
import ListingsSection from "@/components/home/components/ListingsSection";
import SearchSection from "@/components/home/components/SearchSection";
import useAuth from "@/hooks/useAuth";
import landlordService from "@/services/LandlordService";
import roomService from "@/services/RoomService";
import { getApiData } from "@/utils/apiResponse";

const RoomsPage = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({ minPrice: "", maxPrice: "", area: "" });
  const [activeQuickFilter, setActiveQuickFilter] = useState("Tất cả");

  const loadRooms = useCallback(
    async (nextFilters = filters) => {
      try {
        if (user?.role === "landlord") {
          const response = await landlordService.getMyRooms();
          setRooms(getApiData(response, []));
          return;
        }

        const response = await roomService.listRooms({
          minPrice: nextFilters.minPrice || undefined,
          maxPrice: nextFilters.maxPrice || undefined,
          area: nextFilters.area || undefined,
          limit: 50,
        });
        const payload = getApiData(response, {});
        setRooms(payload?.data || []);
      } catch {
        setRooms([]);
      }
    },
    [filters, user?.role]
  );

  useEffect(() => {
    void loadRooms(filters);
  }, [filters, loadRooms]);

  const handleFilterChange = (event) => {
    setFilters((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handlePriceRangeChange = (value) => {
    const [min, max] = value ? value.split("-") : ["", ""];
    const next = { ...filters, minPrice: min || "", maxPrice: max || "" };
    setFilters(next);
    void loadRooms(next);
  };

  const handleQuickFilterChange = (chip) => {
    setActiveQuickFilter(chip);
    const next = { ...filters, area: chip === "Tất cả" ? "" : chip };
    setFilters(next);
    void loadRooms(next);
  };

  return (
    <section className="page-section">
      <div className="mb-6">
        <h1>{user?.role === "landlord" ? "Bài đăng của tôi" : "Tìm phòng"}</h1>
        <p className="text-sm text-slate-500">
          {user?.role === "landlord"
            ? "Chỉ hiển thị các bài đăng thuộc tài khoản chủ trọ của bạn."
            : "Xem toàn bộ phòng đang hiển thị và lọc nhanh theo khu vực, mức giá."}
        </p>
      </div>

      {user?.role === "landlord" ? null : (
        <SearchSection
          filters={filters}
          onFilterChange={handleFilterChange}
          onPriceRangeChange={handlePriceRangeChange}
          onSubmit={() => loadRooms(filters)}
          activeQuickFilter={activeQuickFilter}
          onQuickFilterChange={handleQuickFilterChange}
        />
      )}

      <ListingsSection rooms={rooms} />
    </section>
  );
};

export default RoomsPage;
