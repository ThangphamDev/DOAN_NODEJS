const { Op } = require("sequelize");
const { User } = require("@/entities");
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

    return message;
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
      ],
      order: [["createdAt", "DESC"]],
    });

    const seenPeerIds = new Set();
    const inbox = [];

    messages.forEach((message) => {
      const peer = message.senderId === userId ? message.receiver : message.sender;
      if (!peer || seenPeerIds.has(peer.id)) {
        return;
      }

      seenPeerIds.add(peer.id);
      inbox.push({
        peerId: peer.id,
        peerName: peer.fullName || peer.email || `User ${peer.id}`,
        peerEmail: peer.email,
        lastMessage: message.content,
        lastMessageAt: message.createdAt,
        lastSenderId: message.senderId,
        roomId: message.roomId,
      });
    });

    return inbox;
  }
}

module.exports = new ChatService(messageRepository);
