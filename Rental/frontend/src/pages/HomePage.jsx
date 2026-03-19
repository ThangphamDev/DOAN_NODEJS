import { useCallback, useEffect, useState } from "react";
import CtaSection from "@/components/home/components/CtaSection";
import FeaturesSection from "@/components/home/components/FeaturesSection";
import HeroSection from "@/components/home/components/HeroSection";
import HowItWorksSection from "@/components/home/components/HowItWorksSection";
import ListingsSection from "@/components/home/components/ListingsSection";
import SearchSection from "@/components/home/components/SearchSection";
import TestimonialsSection from "@/components/home/components/TestimonialsSection";
import useAuth from "@/hooks/useAuth";
import landlordService from "@/services/LandlordService";
import roomService from "@/services/RoomService";
import { getApiData } from "@/utils/apiResponse";
import { subscribeToPublicCacheInvalidation } from "@/utils/publicCache";

const HomePage = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({ minPrice: "", maxPrice: "", area: "" });
  const [activeQuickFilter, setActiveQuickFilter] = useState("Tất cả");

  const loadRooms = useCallback(
    async (nextFilters = filters, options = {}) => {
      const { preferCache = true } = options;
      try {
        if (user?.role === "landlord") {
          const response = await landlordService.getMyRooms();
          setRooms(getApiData(response, []));
          return;
        }

        const requestParams = {
          minPrice: nextFilters.minPrice || undefined,
          maxPrice: nextFilters.maxPrice || undefined,
          area: nextFilters.area || undefined,
          limit: 12,
        };
        if (preferCache) {
          const cachedPayload = roomService.getCachedRoomList(requestParams);
          if (cachedPayload?.data) {
            setRooms(cachedPayload.data);
          }
        }

        const response = await roomService.listRooms(requestParams);
        const payload = getApiData(response, {});
        roomService.setCachedRoomList(requestParams, payload);
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

  useEffect(() => {
    if (user?.role === "landlord") return undefined;

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
  }, [filters, loadRooms, user?.role]);

  const handleFilterChange = (event) => {
    setFilters((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handlePriceRangeChange = (value) => {
    const [min, max] = value ? value.split("-") : ["", ""];
    setFilters((prev) => ({ ...prev, minPrice: min || "", maxPrice: max || "" }));
  };

  const handleQuickFilterChange = (chip) => {
    setActiveQuickFilter(chip);
    setFilters((prev) => ({ ...prev, area: chip === "Tất cả" ? "" : chip }));
  };

  if (user?.role === "landlord") {
    return (
      <section className="page-section">
        <div className="mb-6">
          <h1>Bài đăng của tôi</h1>
          <p className="text-sm text-slate-500">
            Giao diện khách hàng chỉ hiển thị các bài đăng thuộc tài khoản chủ trọ của bạn.
          </p>
        </div>

        <ListingsSection rooms={rooms} />
      </section>
    );
  }

  return (
    <>
      <HeroSection />
      <SearchSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onPriceRangeChange={handlePriceRangeChange}
        onSubmit={() => loadRooms(filters, { preferCache: false })}
        activeQuickFilter={activeQuickFilter}
        onQuickFilterChange={handleQuickFilterChange}
      />
      <ListingsSection rooms={rooms.slice(0, 6)} />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
};

export default HomePage;
