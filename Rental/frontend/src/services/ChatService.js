import api from "@/api/client";

class ChatService {
  getInbox() {
    return api.get("/chat/inbox");
  }

  getConversation(peerId, roomId, options = {}) {
    const params = {
      limit: options.limit ?? 10,
      ...(roomId ? { roomId } : {}),
      ...(options.beforeId ? { beforeId: options.beforeId } : {}),
    };
    return api.get(`/chat/conversation/${peerId}`, { params });
  }

  sendMessage(payload) {
    return api.post("/chat/send", payload);
  }

  markConversationAsRead(peerId, roomId) {
    return api.patch(`/chat/read/${peerId}`, null, {
      params: roomId ? { roomId } : {},
    });
  }

  blockUser(userId) {
    return api.post(`/chat/block/${userId}`);
  }

  unblockUser(userId) {
    return api.delete(`/chat/block/${userId}`);
  }
}

export default new ChatService();
