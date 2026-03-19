const multer = require("multer");
const fs = require("fs/promises");
const path = require("path");

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), "uploads")),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeName = file.originalname.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.\-_]/g, "");
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isMimeAllowed = ALLOWED_MIME_TYPES.has(file.mimetype);
  const isExtAllowed = ALLOWED_EXTENSIONS.has(ext);

  if (isMimeAllowed && isExtAllowed) {
    return cb(null, true);
  }

  return cb(new Error("Chỉ cho phép upload ảnh (jpg, png, webp, gif)"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const removeUploadedFiles = async (files = []) => {
  const normalizedFiles = Array.isArray(files) ? files : [files];

  await Promise.all(
    normalizedFiles
      .filter(Boolean)
      .map(async (file) => {
        const targetPath = file.path || (file.filename ? path.join(process.cwd(), "uploads", file.filename) : null);
        if (!targetPath) return;

        try {
          await fs.unlink(targetPath);
        } catch (error) {
          if (error?.code !== "ENOENT") {
            throw error;
          }
        }
      })
  );
};

module.exports = upload;
module.exports.removeUploadedFiles = removeUploadedFiles;
