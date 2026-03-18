const cloneJson = (value) => JSON.parse(JSON.stringify(value));

const DETAIL_BADGE_TONES = ["primary", "success", "warning", "danger", "neutral"];

const DEFAULT_ROOM_DETAILS = {
  badges: [{ label: "Nổi bật", tone: "primary" }],
  quickFacts: [
    { icon: "square_foot", label: "Diện tích", value: "" },
    { icon: "bed", label: "Không gian", value: "" },
    { icon: "bathtub", label: "Sinh hoạt", value: "" },
    { icon: "event_available", label: "Hợp đồng", value: "Linh hoạt" },
  ],
  amenities: [
    { icon: "wifi", label: "Wifi tốc độ cao" },
    { icon: "ac_unit", label: "Máy lạnh" },
    { icon: "local_parking", label: "Chỗ để xe" },
    { icon: "fitness_center", label: "Không gian thoáng" },
    { icon: "local_laundry_service", label: "Khu giặt phơi" },
    { icon: "security", label: "An ninh 24/7" },
  ],
  pricing: {
    label: "Giá thuê mỗi tháng",
    badgeText: "Liên hệ nhanh",
  },
  booking: {
    leaseTerms: ["12 tháng", "6 tháng", "Linh hoạt"],
    defaultLeaseTerm: "12 tháng",
  },
  location: {
    label: "Vị trí phòng trọ",
  },
  owner: {
    subtitle: "Chủ trọ phản hồi nhanh",
  },
};

const asTrimmedString = (value, fallback = "") => {
  if (typeof value === "string") {
    return value.trim() || fallback;
  }

  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value).trim() || fallback;
};

const asObject = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value;
};

const asArray = (value) => (Array.isArray(value) ? value : []);

const parseRoomDetails = (value) => {
  if (!value) {
    return {};
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return asObject(parsed);
    } catch {
      return null;
    }
  }

  return asObject(value);
};

const buildDefaultRoomDetails = (room = {}) => {
  const defaults = cloneJson(DEFAULT_ROOM_DETAILS);

  defaults.location.label = asTrimmedString(room.address, defaults.location.label);

  return defaults;
};

const normalizeBadges = (badges = [], fallbackBadges = []) => {
  const normalized = asArray(badges)
    .map((item) => ({
      label: asTrimmedString(item?.label),
      tone: DETAIL_BADGE_TONES.includes(item?.tone) ? item.tone : "primary",
    }))
    .filter((item) => item.label)
    .slice(0, 8);

  return normalized.length ? normalized : cloneJson(fallbackBadges);
};

const normalizeQuickFacts = (quickFacts = [], fallbackQuickFacts = []) => {
  const normalized = asArray(quickFacts)
    .map((item) => ({
      icon: asTrimmedString(item?.icon, "info"),
      label: asTrimmedString(item?.label, "Thông tin"),
      value: asTrimmedString(item?.value, "Đang cập nhật"),
    }))
    .filter((item) => item.label && item.value)
    .slice(0, 8);

  return normalized.length ? normalized : cloneJson(fallbackQuickFacts);
};

const normalizeAmenities = (amenities = [], fallbackAmenities = []) => {
  const normalized = asArray(amenities)
    .map((item) => ({
      icon: asTrimmedString(item?.icon, "check_circle"),
      label: asTrimmedString(item?.label),
    }))
    .filter((item) => item.label)
    .slice(0, 16);

  return normalized.length ? normalized : cloneJson(fallbackAmenities);
};

const normalizeRoomDetails = (rawDetails, room = {}) => {
  const parsedDetails = parseRoomDetails(rawDetails);

  if (parsedDetails === null) {
    return null;
  }

  const details = asObject(parsedDetails);
  const defaults = buildDefaultRoomDetails(room);
  const pricing = asObject(details.pricing);
  const booking = asObject(details.booking);
  const location = asObject(details.location);
  const owner = asObject(details.owner);

  const leaseTerms = asArray(booking.leaseTerms)
    .map((item) => asTrimmedString(item))
    .filter(Boolean)
    .slice(0, 8);
  const normalizedLeaseTerms = leaseTerms.length ? leaseTerms : cloneJson(defaults.booking.leaseTerms);
  const defaultLeaseTerm = asTrimmedString(
    booking.defaultLeaseTerm,
    normalizedLeaseTerms[0] || defaults.booking.defaultLeaseTerm
  );

  return {
    badges: normalizeBadges(details.badges, defaults.badges),
    quickFacts: normalizeQuickFacts(details.quickFacts, defaults.quickFacts),
    amenities: normalizeAmenities(details.amenities, defaults.amenities),
    pricing: {
      label: asTrimmedString(pricing.label, defaults.pricing.label),
      badgeText: asTrimmedString(pricing.badgeText, defaults.pricing.badgeText),
    },
    booking: {
      leaseTerms: normalizedLeaseTerms,
      defaultLeaseTerm: normalizedLeaseTerms.includes(defaultLeaseTerm)
        ? defaultLeaseTerm
        : normalizedLeaseTerms[0] || defaults.booking.defaultLeaseTerm,
    },
    location: {
      label: asTrimmedString(location.label, defaults.location.label),
    },
    owner: {
      subtitle: asTrimmedString(owner.subtitle, defaults.owner.subtitle),
    },
  };
};

const attachRoomDetails = (room) => {
  if (!room) {
    return room;
  }

  const plainRoom = typeof room.get === "function" ? room.get({ plain: true }) : room;
  const details = normalizeRoomDetails(plainRoom.details, plainRoom);

  if (typeof room.setDataValue === "function") {
    room.setDataValue("details", details || buildDefaultRoomDetails(plainRoom));
    return room;
  }

  return {
    ...plainRoom,
    details: details || buildDefaultRoomDetails(plainRoom),
  };
};

const toRoomListModel = (room) => {
  const plainRoom = typeof room.get === "function" ? room.get({ plain: true }) : room;
  const details = normalizeRoomDetails(plainRoom.details, plainRoom) || buildDefaultRoomDetails(plainRoom);

  return {
    id: plainRoom.id,
    title: plainRoom.title,
    price: plainRoom.price,
    area: plainRoom.area,
    address: plainRoom.address,
    status: plainRoom.status,
    details,
    images: plainRoom.images || [],
    reviews: plainRoom.reviews || [],
    createdAt: plainRoom.createdAt,
    updatedAt: plainRoom.updatedAt,
  };
};

module.exports = {
  DEFAULT_ROOM_DETAILS,
  parseRoomDetails,
  normalizeRoomDetails,
  attachRoomDetails,
  toRoomListModel,
};
