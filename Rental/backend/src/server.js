require("module-alias/register");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const http = require("http");
const { Server } = require("socket.io");
const app = require("@/app");
const setupSocket = require("@/socket");
const { ensureDatabaseExists } = require("@/config/database");
const { sequelize } = require("@/entities");

const port = Number(process.env.PORT || 5000);

const requiredEnvVars = ["JWT_SECRET", "DB_HOST", "DB_PORT", "DB_NAME", "DB_USER"];
const isProduction = process.env.NODE_ENV === "production";

const validateRequiredEnv = () => {
  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  if (missingVars.length) {
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
  }
};

const bootstrap = async () => {
  try {
    validateRequiredEnv();
    await ensureDatabaseExists();
    await sequelize.authenticate();

    const shouldSync = process.env.DB_SYNC !== undefined
      ? String(process.env.DB_SYNC) === "true"
      : !isProduction;
    const shouldAlter = process.env.DB_SYNC_ALTER !== undefined
      ? String(process.env.DB_SYNC_ALTER) === "true"
      : !isProduction;

    if (shouldSync) {
      if (shouldAlter) {
        console.warn(`[DB] sequelize.sync is running with alter=true in ${isProduction ? "production" : "development"} mode.`);
      }

      await sequelize.sync({
        alter: shouldAlter,
      });
    } else if (isProduction) {
      console.log("[DB] sequelize.sync is disabled in production mode.");
    }

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      },
    });

    app.set("io", io);
    setupSocket(io);

    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error.message);
    process.exit(1);
  }
};

bootstrap();
