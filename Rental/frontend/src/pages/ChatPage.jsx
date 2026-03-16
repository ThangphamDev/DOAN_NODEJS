import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import chatService from "@/services/ChatService";
import useAuth from "@/hooks/useAuth";
import { getToken } from "@/utils/storage";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const ChatPage = () => {
  const { user } = useAuth();
  const [peerId, setPeerId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const socket = useMemo(() => {
    const token = getToken();
    if (!token) return null;
    return io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("chat:new", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const loadConversation = async () => {
    if (!peerId) {
      setError("Vui lòng nhập ID người nhận để mở hội thoại");
      setSuccessMessage("");
      return;
    }

    try {
      setError("");
      const response = await chatService.getConversation(peerId, roomId || undefined);
      setMessages(getApiData(response, []));
      setSuccessMessage("Đã tải hội thoại.");
    } catch (err) {
      setError(getApiMessage(err, "Không tải được hội thoại"));
      setSuccessMessage("");
    }
  };

  const sendMessage = async () => {
    if (!peerId || !content.trim()) {
      setError("Vui lòng nhập ID người nhận và nội dung tin nhắn");
      setSuccessMessage("");
      return;
    }

    try {
      setError("");
      await chatService.sendMessage({ receiverId: Number(peerId), content: content.trim(), roomId: roomId || undefined });
      setContent("");
      setSuccessMessage("Tin nhắn đã được gửi.");
    } catch (err) {
      setError(getApiMessage(err, "Không gửi được tin nhắn"));
      setSuccessMessage("");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <section className="customer-page customer-chat-page">
      <div className="customer-page__head">
        <h1>Tin nhắn</h1>
        <p>Kết nối trực tiếp với chủ trọ, trao đổi nhanh và rõ ràng.</p>
      </div>

      <div className="customer-chat-grid">
        <aside className="customer-card customer-chat-sidebar">
          <h3>Mở hội thoại</h3>
          <div className="customer-form-stack">
            <label className="auth-label">
              <span>ID người nhận</span>
              <input
                className="auth-input"
                value={peerId}
                onChange={(e) => setPeerId(e.target.value)}
                placeholder="Ví dụ: 2"
              />
            </label>
            <label className="auth-label">
              <span>Room ID (tuỳ chọn)</span>
              <input
                className="auth-input"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Ví dụ: 5"
              />
            </label>
            <button type="button" className="auth-button" onClick={loadConversation}>
              Tải hội thoại
            </button>
          </div>

          <div className="customer-chat-status">
            {error && <p className="auth-error">{error}</p>}
            {successMessage && <p className="customer-success">{successMessage}</p>}
          </div>
        </aside>

        <article className="customer-card customer-chat-main">
          <div className="customer-chat-messages">
            {messages.length === 0 ? (
              <p className="customer-note">Chưa có tin nhắn. Hãy chọn hội thoại để bắt đầu.</p>
            ) : (
              messages.map((item) => (
                <div
                  key={item.id}
                  className={`customer-chat-bubble ${item.senderId === user?.id ? "customer-chat-bubble--mine" : "customer-chat-bubble--other"}`}
                >
                  <div className="customer-chat-bubble__meta">
                    <strong>{item.senderId === user?.id ? "Bạn" : `User ${item.senderId}`}</strong>
                    <span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : "Vừa xong"}</span>
                  </div>
                  <p>{item.content}</p>
                </div>
              ))
            )}
          </div>

          <div className="customer-chat-compose">
            <textarea
              className="auth-input customer-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập nội dung tin nhắn"
            />
            <button type="button" className="auth-button" onClick={sendMessage}>
              Gửi tin nhắn
            </button>
          </div>
        </article>
      </div>
    </section>
  );
};

export default ChatPage;
