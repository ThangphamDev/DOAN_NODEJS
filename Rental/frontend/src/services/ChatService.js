import api from "@/api/client";

class ChatService {
  getInbox() {
    return api.get("/chat/inbox");
  }

  getConversation(peerId, roomId) {
    const params = roomId ? { roomId } : undefined;
    return api.get(`/chat/conversation/${peerId}`, { params });
  }

  sendMessage(payload) {
    return api.post("/chat/send", payload);
  }

  blockUser(userId) {
    return api.post(`/chat/block/${userId}`);
  }

  unblockUser(userId) {
    return api.delete(`/chat/block/${userId}`);
  }
}

export default new ChatService();
