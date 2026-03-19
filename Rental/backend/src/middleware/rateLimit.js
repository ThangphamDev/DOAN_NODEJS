const createRateLimiter = ({
  windowMs,
  max,
  message = "Too many requests, please try again later.",
  keyGenerator = (req) => req.ip || req.socket?.remoteAddress || "anonymous",
  skip = () => false,
} = {}) => {
  if (!windowMs || !max) {
    throw new Error("windowMs and max are required for rate limiter");
  }

  const store = new Map();

  return (req, res, next) => {
    if (skip(req)) {
      return next();
    }

    const now = Date.now();
    const key = keyGenerator(req);
    const existingEntry = store.get(key);

    if (!existingEntry || existingEntry.expiresAt <= now) {
      store.set(key, {
        count: 1,
        expiresAt: now + windowMs,
      });
      return next();
    }

    if (existingEntry.count >= max) {
      return res.status(429).json({
        success: false,
        message,
      });
    }

    existingEntry.count += 1;
    store.set(key, existingEntry);
    return next();
  };
};

module.exports = createRateLimiter;
