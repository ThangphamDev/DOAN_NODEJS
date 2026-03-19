jest.mock("@/repositories/messageRepository", () => ({
  getList: jest.fn(),
  getOne: jest.fn(),
  insert: jest.fn(),
  updateWhere: jest.fn(),
}));

jest.mock("@/repositories/userBlockRepository", () => ({
  getList: jest.fn(),
  getOne: jest.fn(),
}));

const chatService = require("@/services/chatService");
const messageRepository = require("@/repositories/messageRepository");
const userBlockRepository = require("@/repositories/userBlockRepository");

describe("ChatService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getInbox", () => {
    test("returns unreadCount aggregated per conversation thread", async () => {
      userBlockRepository.getList.mockResolvedValue([]);
      messageRepository.getList.mockResolvedValue([
        {
          id: 30,
          senderId: 2,
          receiverId: 1,
          roomId: 10,
          content: "Tin moi nhat",
          isRead: false,
          createdAt: new Date("2026-03-19T10:00:00Z"),
          sender: { id: 2, fullName: "Khach A", email: "a@example.com" },
          receiver: { id: 1, fullName: "Chu tro", email: "landlord@example.com" },
          room: { id: 10, title: "Phong 10" },
        },
        {
          id: 29,
          senderId: 2,
          receiverId: 1,
          roomId: 10,
          content: "Tin chua doc cu hon",
          isRead: false,
          createdAt: new Date("2026-03-19T09:55:00Z"),
          sender: { id: 2, fullName: "Khach A", email: "a@example.com" },
          receiver: { id: 1, fullName: "Chu tro", email: "landlord@example.com" },
          room: { id: 10, title: "Phong 10" },
        },
        {
          id: 28,
          senderId: 1,
          receiverId: 2,
          roomId: 10,
          content: "Phan hoi",
          isRead: true,
          createdAt: new Date("2026-03-19T09:50:00Z"),
          sender: { id: 1, fullName: "Chu tro", email: "landlord@example.com" },
          receiver: { id: 2, fullName: "Khach A", email: "a@example.com" },
          room: { id: 10, title: "Phong 10" },
        },
        {
          id: 27,
          senderId: 3,
          receiverId: 1,
          roomId: null,
          content: "Thread khac",
          isRead: false,
          createdAt: new Date("2026-03-19T09:40:00Z"),
          sender: { id: 3, fullName: "Khach B", email: "b@example.com" },
          receiver: { id: 1, fullName: "Chu tro", email: "landlord@example.com" },
          room: null,
        },
      ]);

      const inbox = await chatService.getInbox({ userId: 1 });

      expect(inbox).toHaveLength(2);
      expect(inbox[0]).toMatchObject({
        peerId: 2,
        roomId: 10,
        unreadCount: 2,
      });
      expect(inbox[1]).toMatchObject({
        peerId: 3,
        roomId: null,
        unreadCount: 1,
      });
    });
  });

  describe("markConversationAsRead", () => {
    test("marks only unread messages in the selected room thread", async () => {
      messageRepository.updateWhere.mockResolvedValue([3]);

      const result = await chatService.markConversationAsRead({
        userId: 7,
        peerId: 12,
        roomId: 5,
      });

      expect(result).toEqual({ updatedCount: 3 });
      expect(messageRepository.updateWhere).toHaveBeenCalledWith(
        {
          senderId: 12,
          receiverId: 7,
          isRead: false,
          roomId: 5,
        },
        { isRead: true },
        expect.any(Object)
      );
    });

    test("marks all unread messages with peer when roomId is omitted", async () => {
      messageRepository.updateWhere.mockResolvedValue([1]);

      await chatService.markConversationAsRead({
        userId: 7,
        peerId: 12,
      });

      expect(messageRepository.updateWhere).toHaveBeenCalledWith(
        {
          senderId: 12,
          receiverId: 7,
          isRead: false,
        },
        { isRead: true },
        expect.any(Object)
      );
    });
  });
});
