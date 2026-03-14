const { Op } = require("sequelize");
const messageRepository = require("@/repositories/messageRepository");

class ChatService {
  constructor(repository) {
    this.repository = repository;
  }

  async sendMessage({ senderId, receiverId, roomId, content }) {
    if (!receiverId || !content) {
      return { status: 400, data: { message: "receiverId and content are required" } };
    }

    const message = await this.repository.insert({
      senderId,
      receiverId,
      roomId: roomId || null,
      content,
    });

    return { status: 201, data: message };
  }

  async getConversation({ userId, peerId, roomId }) {
    const where = {
      [Op.or]: [
        { senderId: userId, receiverId: peerId },
        { senderId: peerId, receiverId: userId },
      ],
    };

    if (roomId) {
      where.roomId = Number(roomId);
    }

    const messages = await this.repository.getList({
      where,
      order: [["createdAt", "ASC"]],
    });

    return messages;
  }
}

module.exports = new ChatService(messageRepository);
