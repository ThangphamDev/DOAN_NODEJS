import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { normalizeRoomDetails, resolveRoomImageUrl } from "@/utils/roomDetails";

const imgClasses = ["img-1", "img-2", "img-3", "img-4", "img-5", "img-6"];
const badges = [
  { cls: "badge-new", label: "Mới đăng" },
  { cls: "badge-hot", label: "Hot" },
  null,
  { cls: "badge-new", label: "Mới đăng" },
  null,
  { cls: "badge-hot", label: "Hot" },
];

const RoomCard = ({ room, index, uploadBaseUrl }) => {
  const [liked, setLiked] = useState(false);
  const imgClass = imgClasses[index % 6];
  const badge = badges[index % 6];
  const details = normalizeRoomDetails(room.details, room);
  const quickFacts = details.quickFacts || [];
  const amenities = details.amenities || [];
  const imageUrl = resolveRoomImageUrl(room.images?.[0]?.imageUrl || "", uploadBaseUrl);

  const metaItems = [
    quickFacts[0]?.value || "Đang cập nhật",
    quickFacts[1]?.value || "Không gian riêng",
    amenities[0]?.label || "Đầy đủ tiện ích",
  ];

  return (
    <div className="listing-card">
      <div className="listing-img">
        <div
          className={`listing-img-bg ${imageUrl ? "" : imgClass}`}
          style={imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}
        >
          {!imageUrl ? (
            <svg viewBox="0 0 100 80" fill="none" width="100" height="80">
              <rect x="10" y="20" width="80" height="50" rx="4" fill="rgba(100,130,255,0.25)" />
              <rect x="20" y="30" width="25" height="20" rx="3" fill="rgba(100,130,255,0.35)" />
              <rect x="55" y="35" width="25" height="15" rx="3" fill="rgba(100,130,255,0.35)" />
              <rect x="40" y="50" width="20" height="20" rx="2" fill="rgba(80,110,210,0.45)" />
            </svg>
          ) : null}
        </div>
        <button
          type="button"
          className={`listing-fav${liked ? " liked" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            setLiked((value) => !value);
          }}
        >
          <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
        </button>
        {badge ? <span className={`listing-badge ${badge.cls}`}>{badge.label}</span> : null}
      </div>
      <div className="listing-body">
        <div className="listing-location">
          <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>
          {room.address || "Đang cập nhật"}
        </div>
        <div className="listing-title">{room.title}</div>
        <div className="listing-meta">
          {metaItems.map((item, itemIndex) => (
            <span className="meta-item" key={`${room.id}-${itemIndex}`}>
              <svg viewBox="0 0 24 24">
                {itemIndex === 0 ? (
                  <>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </>
                ) : itemIndex === 1 ? (
                  <path d="M2 20h20M4 20V8l8-6 8 6v12" />
                ) : (
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                )}
              </svg>
              {item}
            </span>
          ))}
        </div>
        <div className="listing-footer">
          <div className="listing-price">
            {Number(room.price || 0).toLocaleString("vi-VN")} <span>đ/tháng</span>
          </div>
          <div className="listing-rating">
            {details.badges?.[0]?.label ? <small>{details.badges[0].label}</small> : <small>Mới</small>}
          </div>
        </div>
      </div>
    </div>
  );
};

const ListingsSection = ({ rooms }) => {
  const uploadBaseUrl = useMemo(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    return apiBaseUrl.replace(/\/api\/?$/, "");
  }, []);

  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">Phòng <em>nổi bật</em> hôm nay</h2>
        <Link to="/rooms" className="section-link">Xem tất cả →</Link>
      </div>
      <div className="listings-grid">
        {rooms.map((room, index) => (
          <Link to={`/rooms/${room.id}`} key={room.id} className="listing-link">
            <RoomCard room={room} index={index} uploadBaseUrl={uploadBaseUrl} />
          </Link>
        ))}
        {rooms.length === 0 ? (
          <p className="ui-empty listings-empty">
            Chưa có phòng nào. Hãy thử thay đổi bộ lọc.
          </p>
        ) : null}
      </div>
    </section>
  );
};

export default ListingsSection;
