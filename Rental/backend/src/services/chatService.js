const { Op } = require("sequelize");
const { User, Room } = require("@/entities");
const messageRepository = require("@/repositories/messageRepository");
const userBlockRepository = require("@/repositories/userBlockRepository");
const ApiError = require("@/utils/ApiError");

class ChatService {
  constructor(repository) {
    this.repository = repository;
  }

  buildThreadKey({ peerId, roomId }) {
    return `${Number(peerId || 0)}-${Number(roomId || 0)}`;
  }

  async sendMessage({ senderId, receiverId, roomId, content }, options = {}) {
    if (!receiverId || !content) {
      throw new ApiError(400, "receiverId and content are required");
    }

    const blockedRelationship = await userBlockRepository.getOne({
      where: {
        [Op.or]: [
          { blockerId: senderId, blockedUserId: receiverId },
          { blockerId: receiverId, blockedUserId: senderId },
        ],
      },
    });

    if (blockedRelationship) {
      throw new ApiError(403, "Cuộc trò chuyện này đã bị chặn");
    }

    const message = await this.repository.insert({
      senderId,
      receiverId,
      roomId: roomId || null,
      content,
    }, options);

    const include = [
      { model: User, as: "sender", attributes: ["id", "fullName", "email"] },
      { model: User, as: "receiver", attributes: ["id", "fullName", "email"] },
    ];

    if (roomId) {
      include.push({ model: Room, as: "room", attributes: ["id", "title"] });
    }

    return this.repository.getOne({
      where: { id: message.id },
      include,
      transaction: options.transaction,
    });
  }

  async getConversation({ userId, peerId, roomId, limit = 10, beforeId }) {
    const where = {
      [Op.or]: [
        { senderId: userId, receiverId: peerId },
        { senderId: peerId, receiverId: userId },
      ],
    };

    if (roomId) {
      where.roomId = Number(roomId);
    }

    if (beforeId) {
      where.id = { [Op.lt]: Number(beforeId) };
    }

    const normalizedLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const rows = await this.repository.getList({
      where,
      order: [["createdAt", "DESC"]],
      limit: normalizedLimit + 1,
    });

    const hasMore = rows.length > normalizedLimit;
    const items = rows
      .slice(0, normalizedLimit)
      .reverse();

    return {
      items,
      hasMore,
    };
  }

  async getInbox({ userId }) {
    const blockedUsers = await userBlockRepository.getList({
      where: {
        blockerId: userId,
      },
      attributes: ["blockedUserId"],
    });

    const blockedUserIds = new Set(blockedUsers.map((item) => Number(item.blockedUserId)));
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
    const unreadCountByThread = new Map();
    const inbox = [];

    messages.forEach((message) => {
      const peerId = Number(message.senderId) === Number(userId) ? Number(message.receiverId) : Number(message.senderId);
      const threadKey = this.buildThreadKey({
        peerId,
        roomId: message.roomId,
      });

      if (Number(message.receiverId) === Number(userId) && !message.isRead) {
        unreadCountByThread.set(threadKey, Number(unreadCountByThread.get(threadKey) || 0) + 1);
      }
    });

    messages.forEach((message) => {
      const peer = message.senderId === userId ? message.receiver : message.sender;
      const threadKey = this.buildThreadKey({
        peerId: peer?.id,
        roomId: message.roomId,
      });

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
        blockedByMe: blockedUserIds.has(Number(peer.id)),
        unreadCount: Number(unreadCountByThread.get(threadKey) || 0),
      });
    });

    return inbox;
  }

  async markConversationAsRead({ userId, peerId, roomId }, options = {}) {
    if (!peerId) {
      throw new ApiError(400, "peerId is required");
    }

    const where = {
      senderId: Number(peerId),
      receiverId: Number(userId),
      isRead: false,
    };

    if (roomId !== undefined && roomId !== null && roomId !== "") {
      where.roomId = Number(roomId);
    }

    const [updatedCount] = await this.repository.updateWhere(
      where,
      { isRead: true },
      options
    );

    return { updatedCount };
  }

  async blockUser({ blockerId, blockedUserId }, options = {}) {
    if (!blockedUserId || Number(blockerId) === Number(blockedUserId)) {
      throw new ApiError(400, "Invalid blocked user");
    }

    const existingBlock = await userBlockRepository.getOne({
      where: {
        blockerId,
        blockedUserId,
      },
    });

    if (existingBlock) {
      return { message: "User already blocked" };
    }

    await userBlockRepository.insert(
      {
        blockerId,
        blockedUserId,
      },
      options
    );

    return { message: "User blocked" };
  }

  async unblockUser({ blockerId, blockedUserId }, options = {}) {
    await userBlockRepository.deleteWhere(
      {
        blockerId,
        blockedUserId,
      },
      options
    );

    return { message: "User unblocked" };
  }
}

module.exports = new ChatService(messageRepository);
