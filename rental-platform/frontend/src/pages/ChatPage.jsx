import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import chatService from "@/services/ChatService";
import useAuth from "@/hooks/useAuth";
import { getToken } from "@/utils/storage";

const ChatPage = () => {
  const { user } = useAuth();
  const [peerId, setPeerId] = useState("");
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");

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
    const { data } = await chatService.getConversation(peerId);
    setMessages(data);
  };

  const sendMessage = async () => {
    if (!peerId || !content) return;
    await chatService.sendMessage({ receiverId: Number(peerId), content });
    setContent("");
  };

  return (
    <section>
      <h1>Chat</h1>
      <div className="grid-2">
        <input value={peerId} onChange={(e) => setPeerId(e.target.value)} placeholder="Nhập ID người nhận" />
        <button onClick={loadConversation}>Mở hội thoại</button>
      </div>
      <div className="chat-box">
        {messages.map((item) => (
          <p key={item.id} className={item.senderId === user?.id ? "mine" : "other"}>
            {item.senderId === user?.id ? "Bạn" : `User ${item.senderId}`}: {item.content}
          </p>
        ))}
      </div>
      <div className="grid-2">
        <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Nhập tin nhắn" />
        <button onClick={sendMessage}>Gửi</button>
      </div>
    </section>
  );
};

export default ChatPage;
