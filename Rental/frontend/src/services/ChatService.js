import api from "@/api/client";

class ChatService {
  getConversation(peerId, roomId) {
    const params = roomId ? { roomId } : undefined;
    return api.get(`/chat/conversation/${peerId}`, { params });
  }

  sendMessage(payload) {
    return api.post("/chat/send", payload);
  }
}

export default new ChatService();