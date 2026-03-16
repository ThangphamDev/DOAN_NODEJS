import { useEffect, useState } from "react";
import roomService from "@/services/RoomService";
import HeroSection from "@/components/home/components/HeroSection";
import SearchSection from "@/components/home/components/SearchSection";
import ListingsSection from "@/components/home/components/ListingsSection";
import HowItWorksSection from "@/components/home/components/HowItWorksSection";
import FeaturesSection from "@/components/home/components/FeaturesSection";
import TestimonialsSection from "@/components/home/components/TestimonialsSection";
import CtaSection from "@/components/home/components/CtaSection";
import { getApiData } from "@/utils/apiResponse";
const HomePage = () => {
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({ minPrice: "", maxPrice: "", area: "" });
  const [activeQuickFilter, setActiveQuickFilter] = useState("Tất cả");

  useEffect(() => {
    roomService
      .listRooms({})
      .then((response) => {
        const payload = getApiData(response, {});
        setRooms(payload?.data || []);
      })
      .catch(() => {});
  }, []);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePriceRangeChange = (value) => {
    const [min, max] = value ? value.split("-") : ["", ""];
    const next = { ...filters, minPrice: min || "", maxPrice: max || "" };
    setFilters(next);
    roomService
      .listRooms({ minPrice: min || undefined, maxPrice: max || undefined, area: next.area || undefined })
      .then((response) => {
        const payload = getApiData(response, {});
        setRooms(payload?.data || []);
      })
      .catch(() => {});
  };

  const handleQuickFilterChange = (chip) => {
    setActiveQuickFilter(chip);
    const next = { ...filters, area: chip === "Tất cả" ? "" : chip };
    setFilters(next);
    roomService
      .listRooms({ minPrice: next.minPrice || undefined, maxPrice: next.maxPrice || undefined, area: next.area || undefined })
      .then((response) => {
        const payload = getApiData(response, {});
        setRooms(payload?.data || []);
      })
      .catch(() => {});
  };

  const handleSearch = () => {
    roomService
      .listRooms({ minPrice: filters.minPrice || undefined, maxPrice: filters.maxPrice || undefined, area: filters.area || undefined })
      .then((response) => {
        const payload = getApiData(response, {});
        setRooms(payload?.data || []);
      })
      .catch(() => {});
  };

  return (
    <div className="home-page">
      <HeroSection />
      <SearchSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onPriceRangeChange={handlePriceRangeChange}
        onSubmit={handleSearch}
        activeQuickFilter={activeQuickFilter}
        onQuickFilterChange={handleQuickFilterChange}
      />
      <ListingsSection rooms={rooms.slice(0, 6)} />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CtaSection />
    </div>
  );
};

export default HomePage;
