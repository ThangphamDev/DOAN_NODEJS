const { Op } = require("sequelize");
const { User, Room } = require("@/entities");
const messageRepository = require("@/repositories/messageRepository");
const ApiError = require("@/utils/ApiError");

class ChatService {
  constructor(repository) {
    this.repository = repository;
  }

  async sendMessage({ senderId, receiverId, roomId, content }, options = {}) {
    if (!receiverId || !content) {
      throw new ApiError(400, "receiverId and content are required");
    }

    const message = await this.repository.insert({
      senderId,
      receiverId,
      roomId: roomId || null,
      content,
    }, options);

    return this.repository.getOne({
      where: { id: message.id },
      include: roomId ? [{ model: Room, as: "room", attributes: ["id", "title"] }] : [],
    });
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

  async getInbox({ userId }) {
    const messages = await this.repository.getList({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      },
      include: [
        { model: User, as: "sender", attributes: ["id", "fullName", "email"] },
        { model: User, as: "receiver", attributes: ["id", "fullName", "email"] },
        { model: Room, as: "room", attributes: ["id", "title"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    const seenThreadKeys = new Set();
    const inbox = [];

    messages.forEach((message) => {
      const peer = message.senderId === userId ? message.receiver : message.sender;
      const threadKey = `${peer?.id || 0}-${Number(message.roomId || 0)}`;

      if (!peer || seenThreadKeys.has(threadKey)) {
        return;
      }

      seenThreadKeys.add(threadKey);
      inbox.push({
        peerId: peer.id,
        peerName: peer.fullName || peer.email || `User ${peer.id}`,
        peerEmail: peer.email,
        lastMessage: message.content,
        lastMessageAt: message.createdAt,
        lastSenderId: message.senderId,
        roomId: message.roomId,
        roomTitle: message.room?.title || "",
      });
    });

    return inbox;
  }
}

module.exports = new ChatService(messageRepository);
