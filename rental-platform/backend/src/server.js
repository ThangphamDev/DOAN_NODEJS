require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const app = require("@/app");
const setupSocket = require("@/socket");
const { sequelize } = require("@/entities");

const port = Number(process.env.PORT || 5000);

const bootstrap = async () => {
  try {
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
