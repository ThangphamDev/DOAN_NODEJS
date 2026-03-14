import api from "@/api/client";

class ChatService {
  getConversation(peerId) {
    return api.get(`/chat/conversation/${peerId}`);
  }

  sendMessage(payload) {
    return api.post("/chat/send", payload);
  }
}

export default new ChatService();