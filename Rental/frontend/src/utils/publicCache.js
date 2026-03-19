const PUBLIC_CACHE_PREFIX = "public-cache:";
const PUBLIC_CACHE_SIGNAL_KEY = `${PUBLIC_CACHE_PREFIX}signal`;
const DEFAULT_PUBLIC_CACHE_TTL = 5 * 60 * 1000;

const safeParse = (value, fallback = null) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const serializeParams = (params = {}) =>
  Object.entries(params || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${String(value)}`)
    .join("|");

export const buildPublicCacheKey = (scope, identifier = "") =>
  `${PUBLIC_CACHE_PREFIX}${scope}${identifier ? `:${identifier}` : ""}`;

export const buildRoomListCacheKey = (params = {}) => buildPublicCacheKey("rooms:list", serializeParams(params));

export const buildRoomDetailCacheKey = (id) => buildPublicCacheKey("rooms:detail", String(id));

export const getPublicCache = (key, options = {}) => {
  if (typeof window === "undefined") return null;

  const { maxAgeMs = DEFAULT_PUBLIC_CACHE_TTL } = options;
  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) return null;

  const parsed = safeParse(rawValue);
  if (!parsed?.cachedAt) return null;

  if (maxAgeMs > 0 && Date.now() - Number(parsed.cachedAt) > maxAgeMs) {
    return null;
  }

  return parsed.data ?? null;
};

export const setPublicCache = (key, data) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    key,
    JSON.stringify({
      cachedAt: Date.now(),
      data,
    })
  );
};

export const invalidatePublicCacheByPredicate = (predicate) => {
  if (typeof window === "undefined") return;

  const keysToRemove = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !key.startsWith(PUBLIC_CACHE_PREFIX) || key === PUBLIC_CACHE_SIGNAL_KEY) continue;
    if (predicate(key)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => window.localStorage.removeItem(key));
};

export const emitPublicCacheInvalidation = (detail = {}) => {
  if (typeof window === "undefined") return;

  const payload = {
    ...detail,
    timestamp: Date.now(),
  };

  window.localStorage.setItem(PUBLIC_CACHE_SIGNAL_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent("public-cache:invalidate", { detail: payload }));
};

export const invalidatePublicRoomCache = ({ roomId } = {}) => {
  invalidatePublicCacheByPredicate((key) => {
    if (key.includes("rooms:list")) return true;
    if (roomId && key === buildRoomDetailCacheKey(roomId)) return true;
    return false;
  });

  emitPublicCacheInvalidation({ scope: "rooms", roomId: roomId ? Number(roomId) : null });
};

export const subscribeToPublicCacheInvalidation = (handler) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const onCustomEvent = (event) => {
    handler(event.detail || {});
  };

  const onStorage = (event) => {
    if (event.key !== PUBLIC_CACHE_SIGNAL_KEY || !event.newValue) return;
    handler(safeParse(event.newValue, {}));
  };

  window.addEventListener("public-cache:invalidate", onCustomEvent);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener("public-cache:invalidate", onCustomEvent);
    window.removeEventListener("storage", onStorage);
  };
};
