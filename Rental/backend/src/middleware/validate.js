const { removeUploadedFiles } = require("@/utils/upload");

const validate = (validator) => async (req, res, next) => {
  try {
    if (typeof validator === "function") {
      const result = validator(req);
      if (result?.error) {
        await removeUploadedFiles(req.files);
        return res.status(400).json({ success: false, message: result.error.message || "Validation failed" });
      }
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = validate;
