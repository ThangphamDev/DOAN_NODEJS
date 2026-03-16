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

    if (String(process.env.DB_SYNC || "true") === "true") {
      await sequelize.sync({
        alter: String(process.env.DB_SYNC_ALTER || "true") === "true",
      });
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
