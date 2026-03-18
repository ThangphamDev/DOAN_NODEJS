export const ROOM_BADGE_TONES = [
  { value: "primary", label: "Primary" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "danger", label: "Danger" },
  { value: "neutral", label: "Neutral" },
];

export const ROOM_ICON_OPTIONS = [
  "wifi",
  "ac_unit",
  "local_parking",
  "security",
  "fitness_center",
  "local_laundry_service",
  "square_foot",
  "bed",
  "bathtub",
  "event_available",
  "kitchen",
  "checkroom",
  "elevator",
  "storefront",
  "school",
  "balcony",
  "yard",
  "pets",
  "home_work",
  "info",
];

const cloneJson = (value) => JSON.parse(JSON.stringify(value));

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

const asString = (value, fallback = "") => {
  if (typeof value === "string") {
    return value.trim() || fallback;
  }

  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value).trim() || fallback;
};

const asObject = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value : {});
const asArray = (value) => (Array.isArray(value) ? value : []);
let imageItemCounter = 0;

const getDefaultRoomDetails = (room = {}) => {
  const defaults = cloneJson(DEFAULT_ROOM_DETAILS);
  defaults.location.label = asString(room.address, defaults.location.label);
  return defaults;
};

export const createDefaultRoomDetails = (room = {}) => getDefaultRoomDetails(room);

export const normalizeRoomDetails = (rawDetails, room = {}) => {
  const details = asObject(rawDetails);
  const defaults = getDefaultRoomDetails(room);
  const pricing = asObject(details.pricing);
  const booking = asObject(details.booking);
  const location = asObject(details.location);
  const owner = asObject(details.owner);

  const badges = asArray(details.badges)
    .map((item) => ({
      label: asString(item?.label),
      tone: ROOM_BADGE_TONES.some((tone) => tone.value === item?.tone) ? item.tone : "primary",
    }))
    .filter((item) => item.label);

  const quickFacts = asArray(details.quickFacts)
    .map((item) => ({
      icon: asString(item?.icon, "info"),
      label: asString(item?.label, "Thông tin"),
      value: asString(item?.value, "Đang cập nhật"),
    }))
    .filter((item) => item.label && item.value);

  const amenities = asArray(details.amenities)
    .map((item) => ({
      icon: asString(item?.icon, "check_circle"),
      label: asString(item?.label),
    }))
    .filter((item) => item.label);

  const leaseTerms = asArray(booking.leaseTerms).map((item) => asString(item)).filter(Boolean);
  const normalizedLeaseTerms = leaseTerms.length ? leaseTerms : cloneJson(defaults.booking.leaseTerms);
  const defaultLeaseTerm = asString(booking.defaultLeaseTerm, normalizedLeaseTerms[0]);

  return {
    badges: badges.length ? badges : cloneJson(defaults.badges),
    quickFacts: quickFacts.length ? quickFacts : cloneJson(defaults.quickFacts),
    amenities: amenities.length ? amenities : cloneJson(defaults.amenities),
    pricing: {
      label: asString(pricing.label, defaults.pricing.label),
      badgeText: asString(pricing.badgeText, defaults.pricing.badgeText),
    },
    booking: {
      leaseTerms: normalizedLeaseTerms,
      defaultLeaseTerm: normalizedLeaseTerms.includes(defaultLeaseTerm) ? defaultLeaseTerm : normalizedLeaseTerms[0],
    },
    location: {
      label: asString(location.label, defaults.location.label),
    },
    owner: {
      subtitle: asString(owner.subtitle, defaults.owner.subtitle),
    },
  };
};

export const createInitialRoomForm = (room) => ({
  title: room?.title || "",
  price: room?.price ? String(room.price) : "",
  area: room?.area || "",
  address: room?.address || "",
  description: room?.description || "",
  status: room?.status || "active",
  imageItems: [],
  details: normalizeRoomDetails(room?.details, room || {}),
});

export const getBadgeToneClasses = (tone) => {
  if (tone === "success") return "bg-emerald-500/10 text-emerald-600";
  if (tone === "warning") return "bg-amber-500/10 text-amber-700";
  if (tone === "danger") return "bg-rose-500/10 text-rose-600";
  if (tone === "neutral") return "bg-slate-200 text-slate-700";
  return "bg-primary/10 text-primary";
};

export const resolveRoomImageUrl = (imageUrl, uploadBaseUrl) => {
  if (!imageUrl) return "";
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${uploadBaseUrl}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
};

const createImageItemId = (prefix) => `${prefix}-${Date.now()}-${imageItemCounter++}`;

export const createExistingImageItems = (roomImages = [], uploadBaseUrl) =>
  asArray(roomImages).map((image, index) => ({
    clientId: createImageItemId("existing"),
    type: "existing",
    imageId: image.id,
    name: image.imageUrl?.split("/").pop() || `image-${index + 1}`,
    previewUrl: resolveRoomImageUrl(image.imageUrl, uploadBaseUrl),
    imageUrl: image.imageUrl,
    sortOrder: Number(image.sortOrder ?? index),
  }));

export const createNewImageItems = (files = []) =>
  asArray(files).map((file, index) => ({
    clientId: createImageItemId("new"),
    type: "new",
    file,
    name: file.name || `new-image-${index + 1}`,
    previewUrl: URL.createObjectURL(file),
  }));

export const hydrateRoomForm = (room, uploadBaseUrl) => ({
  ...createInitialRoomForm(room),
  imageItems: createExistingImageItems(room?.images || [], uploadBaseUrl),
});

export const buildRoomImageManifest = (imageItems = []) =>
  asArray(imageItems).map((item) =>
    item.type === "existing"
      ? { type: "existing", id: item.imageId }
      : { type: "new", clientId: item.clientId }
  );
