const validate = (validator) => (req, res, next) => {
  try {
    if (typeof validator === "function") {
      const result = validator(req);
      if (result?.error) {
        return res.status(400).json({ message: result.error.message || "Validation failed" });
      }
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = validate;
