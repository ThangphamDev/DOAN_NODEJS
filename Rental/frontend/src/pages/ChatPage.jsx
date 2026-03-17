import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import chatService from "@/services/ChatService";
import useAuth from "@/hooks/useAuth";
import { getToken } from "@/utils/storage";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const ChatPage = () => {
  const { user } = useAuth();
  const [inbox, setInbox] = useState([]);
  const [activePeerId, setActivePeerId] = useState(null);
  const [activePeerName, setActivePeerName] = useState("");
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const socket = useMemo(() => {
    const token = getToken();
    if (!token) return null;
    return io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
    });
  }, []);

  const loadInbox = async () => {
    try {
      const response = await chatService.getInbox();
      const items = getApiData(response, []);
      setInbox(items);

      if (!activePeerId && items.length > 0) {
        setActivePeerId(items[0].peerId);
        setActivePeerName(items[0].peerName);
      }

      setError("");
    } catch (err) {
      setError(getApiMessage(err, "Không tải được danh sách hội thoại"));
    }
  };

  const loadConversation = async (peerId, peerName = "") => {
    try {
      const response = await chatService.getConversation(peerId);
      setMessages(getApiData(response, []));
      setActivePeerId(peerId);
      setActivePeerName(peerName || `User ${peerId}`);
      setError("");
    } catch (err) {
      setError(getApiMessage(err, "Không tải được hội thoại"));
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initInbox = async () => {
      try {
        const response = await chatService.getInbox();
        if (!isMounted) return;

        const items = getApiData(response, []);
        setInbox(items);
        if (items.length > 0) {
          setActivePeerId(items[0].peerId);
          setActivePeerName(items[0].peerName);
        }
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setError(getApiMessage(err, "Không tải được danh sách hội thoại"));
      }
    };

    initInbox();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("chat:new", (message) => {
      const messagePeerId = message.senderId === user?.id ? message.receiverId : message.senderId;

      setInbox((prev) => {
        const matched = prev.find((item) => item.peerId === messagePeerId);
        const nextItem = {
          peerId: messagePeerId,
          peerName: matched?.peerName || `User ${messagePeerId}`,
          lastMessage: message.content,
          lastMessageAt: message.createdAt,
          lastSenderId: message.senderId,
          roomId: message.roomId,
        };

        const filtered = prev.filter((item) => item.peerId !== messagePeerId);
        return [nextItem, ...filtered];
      });

      if (activePeerId === messagePeerId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, user?.id, activePeerId]);

  useEffect(() => {
    if (activePeerId) {
      loadConversation(activePeerId, activePeerName);
    }
  }, [activePeerId]);

  const sendMessage = async () => {
    if (!activePeerId || !content.trim()) {
      setError("Vui lòng chọn hội thoại và nhập nội dung");
      return;
    }

    try {
      await chatService.sendMessage({
        receiverId: Number(activePeerId),
        content: content.trim(),
      });
      setContent("");
      setError("");
      await loadInbox();
    } catch (err) {
      setError(getApiMessage(err, "Không gửi được tin nhắn"));
    }
  };

  return (
    <section className="customer-page customer-chat-page">
      <div className="customer-page__head">
        <h1>Tin nhắn</h1>
        <p>Xem lịch sử và trò chuyện theo thời gian thực như messenger.</p>
      </div>

      {error && <p className="auth-error">{error}</p>}

      <div className="customer-chat-grid customer-messenger-grid">
        <aside className="customer-card customer-chat-sidebar customer-messenger-list">
          <h3>Hội thoại</h3>
          {inbox.length === 0 ? (
            <p className="customer-note">Bạn chưa có hội thoại nào.</p>
          ) : (
            <div className="customer-messenger-items">
              {inbox.map((item) => (
                <button
                  key={item.peerId}
                  type="button"
                  className={`customer-messenger-item ${activePeerId === item.peerId ? "is-active" : ""}`}
                  onClick={() => loadConversation(item.peerId, item.peerName)}
                >
                  <div className="customer-messenger-item__top">
                    <strong>{item.peerName}</strong>
                    <span>{item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleTimeString() : ""}</span>
                  </div>
                  <p>{item.lastSenderId === user?.id ? `Bạn: ${item.lastMessage}` : item.lastMessage}</p>
                </button>
              ))}
            </div>
          )}
        </aside>

        <article className="customer-card customer-chat-main">
          <div className="customer-chat-title">
            <h3>{activePeerName || "Chọn một hội thoại"}</h3>
          </div>

          <div className="customer-chat-messages">
            {!activePeerId ? (
              <p className="customer-note">Chọn người dùng ở bên trái để bắt đầu nhắn.</p>
            ) : messages.length === 0 ? (
              <p className="customer-note">Chưa có tin nhắn trong hội thoại này.</p>
            ) : (
              messages.map((item) => (
                <div
                  key={item.id}
                  className={`customer-chat-bubble ${item.senderId === user?.id ? "customer-chat-bubble--mine" : "customer-chat-bubble--other"}`}
                >
                  <div className="customer-chat-bubble__meta">
                    <strong>{item.senderId === user?.id ? "Bạn" : activePeerName || `User ${item.senderId}`}</strong>
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
              onChange={(event) => setContent(event.target.value)}
              placeholder="Nhập nội dung tin nhắn"
            />
            <button type="button" className="auth-button" onClick={sendMessage} disabled={!activePeerId}>
              Gửi tin nhắn
            </button>
          </div>
        </article>
      </div>
    </section>
  );
};

export default ChatPage;
