const jwt = require("jsonwebtoken");
const { Message } = require("@/entities");

const setupSocket = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Unauthorized"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      return next();
    } catch (error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.user.id}`);

    socket.on("chat:send", async (payload) => {
      try {
        const { receiverId, content, roomId } = payload;
        if (!receiverId || !content) {
          return;
        }

        const message = await Message.create({
          senderId: socket.user.id,
          receiverId,
          content,
          roomId: roomId || null,
        });

        io.to(`user:${receiverId}`).emit("chat:new", message);
        io.to(`user:${socket.user.id}`).emit("chat:new", message);
      } catch (error) {
        socket.emit("chat:error", { message: "Cannot send message" });
      }
    });
  });
};

module.exports = setupSocket;
