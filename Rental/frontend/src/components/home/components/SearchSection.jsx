import { useEffect, useState } from "react";
import { quickFilters } from "@/components/home/homeData";

const SearchSection = ({ filters, onFilterChange, onSubmit, activeQuickFilter, onQuickFilterChange, onPriceRangeChange }) => {
  const placeholderOptions = ["Quận 3, TP.HCM", "Bình Thạnh...", "Đường Nguyễn Trãi...", "Quận 7, gần RMIT..."];
  const [placeholderText, setPlaceholderText] = useState(placeholderOptions[0]);
  const [areaInput, setAreaInput] = useState(filters.area || "");

  useEffect(() => {
    let placeholderIndex = 0;

    const intervalId = setInterval(() => {
      placeholderIndex = (placeholderIndex + 1) % placeholderOptions.length;
      setPlaceholderText(placeholderOptions[placeholderIndex]);
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setAreaInput(filters.area || "");
  }, [filters.area]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (areaInput === (filters.area || "")) return;

      onFilterChange({
        target: {
          name: "area",
          value: areaInput,
        },
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [areaInput, filters.area, onFilterChange]);

  return (
    <section className="search-section" id="search">
      <div className="search-box">
        <div className="search-field">
          <label>Địa điểm</label>
          <input
            type="text"
            name="area"
            value={areaInput}
            onChange={(event) => setAreaInput(event.target.value)}
            placeholder={placeholderText}
          />
        </div>
        <div className="search-field">
          <label>Loại phòng</label>
          <select>
            <option>Tất cả loại</option>
            <option>Phòng trọ</option>
            <option>Căn hộ dịch vụ</option>
            <option>Nhà nguyên căn</option>
          </select>
        </div>
        <div className="search-field">
          <label>Khoảng giá</label>
          <select onChange={(event) => onPriceRangeChange(event.target.value)}>
            <option value="">Mọi giá</option>
            <option value="0-2000000">Dưới 2 triệu</option>
            <option value="2000000-4000000">2 – 4 triệu</option>
            <option value="4000000-7000000">4 – 7 triệu</option>
            <option value="7000000-">Trên 7 triệu</option>
          </select>
        </div>
        <div className="search-action">
          <button type="button" className="btn-search" onClick={onSubmit}>
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            Tìm kiếm
          </button>
        </div>
      </div>

      <div className="quick-filters">
        {quickFilters.map((chip) => (
          <button
            type="button"
            key={chip}
            className={`filter-chip${activeQuickFilter === chip ? " active" : ""}`}
            onClick={() => onQuickFilterChange(chip)}
          >
            {chip}
          </button>
        ))}
      </div>
    </section>
  );
};

export default SearchSection;
