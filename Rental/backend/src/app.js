require("module-alias/register");

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const authController = require("@/controllers/authController");
const roomController = require("@/controllers/roomController");
const favoriteController = require("@/controllers/favoriteController");
const reviewController = require("@/controllers/reviewController");
const appointmentController = require("@/controllers/appointmentController");
const chatController = require("@/controllers/chatController");
const landlordRoomController = require("@/controllers/landlord/roomController");
const landlordAppointmentController = require("@/controllers/landlord/appointmentController");
const adminRoomController = require("@/controllers/admin/roomController");
const adminUserController = require("@/controllers/admin/userController");
const { authenticate } = require("@/middleware/auth");
const authorize = require("@/middleware/authorize");
const createRateLimiter = require("@/middleware/rateLimit");
const { sendSuccess } = require("@/utils/response");
const errorHandler = require("@/middleware/errorHandler");

const isAuthWriteRequest = (req) =>
  req.method === "POST" && ["/api/auth/login", "/api/auth/register"].includes(req.path);

const app = express();
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Bạn đã thử quá nhiều lần, vui lòng thử lại sau 15 phút nữa .",
  skip: (req) => !isAuthWriteRequest(req),
});
const readRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  max: 600,
  message: "Có quá nhiều yêu cầu từ thiết bị của bạn. Vui lòng thử lại sau.",
  skip: (req) => req.method !== "GET",
});
const writeRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  max: 180,
  message: "Có quá nhiều yêu cầu từ thiết bị của bạn. Vui lòng thử lại sau.",
  skip: (req) => req.method === "GET" || isAuthWriteRequest(req),
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/auth", authRateLimiter);
app.use("/api", readRateLimiter);
app.use("/api", writeRateLimiter);

authController.registerRoutes(app, "/api");
roomController.registerRoutes(app, "/api");
favoriteController.registerRoutes(app, "/api");
reviewController.registerRoutes(app, "/api");
appointmentController.registerRoutes(app, "/api");
chatController.registerRoutes(app, "/api");
landlordRoomController.registerRoutes(app, "/api");
landlordAppointmentController.registerRoutes(app, "/api");
adminRoomController.registerRoutes(app, "/api");
adminUserController.registerRoutes(app, "/api");

app.get("/api/admin", authenticate, authorize("admin"), (req, res) => {
  return sendSuccess(res, { data: { area: "admin" }, message: "Admin API" });
});
app.get("/api/health", (req, res) => {
  return sendSuccess(res, { data: { status: "ok" }, message: "API is running" });
});

app.use(errorHandler);

module.exports = app;
