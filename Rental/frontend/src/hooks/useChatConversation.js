import { useCallback, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import chatService from "@/services/ChatService";
import useAuth from "@/hooks/useAuth";
import { getToken } from "@/utils/storage";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const toThread = (item = {}) => ({
  peerId: item.peerId ? Number(item.peerId) : null,
  peerName: item.peerName || (item.peerId ? `User ${item.peerId}` : ""),
  peerEmail: item.peerEmail || "",
  roomId: item.roomId ? Number(item.roomId) : null,
});

const isSameThread = (left, right) =>
  Number(left?.peerId) === Number(right?.peerId) && Number(left?.roomId || 0) === Number(right?.roomId || 0);

const useChatConversation = () => {
  const { user } = useAuth();
  const [inbox, setInbox] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
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

  const loadInbox = useCallback(async () => {
    try {
      const response = await chatService.getInbox();
      const items = getApiData(response, []);
      setInbox(items);
      setError("");
      setActiveThread((prev) => {
        if (!items.length) return null;
        if (prev?.peerId) {
          const matched = items.find((item) => Number(item.peerId) === Number(prev.peerId));
          if (matched) {
            return {
              ...toThread(matched),
              peerName: prev.peerName || matched.peerName,
              peerEmail: prev.peerEmail || matched.peerEmail || "",
            };
          }
        }
        return toThread(items[0]);
      });
    } catch (err) {
      setError(getApiMessage(err, "Không tải được danh sách hội thoại"));
    }
  }, []);

  const loadMessages = useCallback(async (thread) => {
    if (!thread?.peerId) {
      setMessages([]);
      return;
    }

    try {
      const response = await chatService.getConversation(thread.peerId, thread.roomId || undefined);
      setMessages(getApiData(response, []));
      setError("");
    } catch (err) {
      setError(getApiMessage(err, "Không tải được hội thoại"));
    }
  }, []);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    loadMessages(activeThread);
  }, [activeThread, loadMessages]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      const messagePeerId = message.senderId === user?.id ? message.receiverId : message.senderId;

      setInbox((prev) => {
        const matched = prev.find((item) => Number(item.peerId) === Number(messagePeerId));
        const nextItem = {
          peerId: messagePeerId,
          peerName: matched?.peerName || `User ${messagePeerId}`,
          peerEmail: matched?.peerEmail || "",
          lastMessage: message.content,
          lastMessageAt: message.createdAt,
          lastSenderId: message.senderId,
          roomId: message.roomId || matched?.roomId || null,
        };

        return [nextItem, ...prev.filter((item) => Number(item.peerId) !== Number(messagePeerId))];
      });

      if (
        Number(activeThread?.peerId) === Number(messagePeerId) &&
        (!activeThread?.roomId || Number(activeThread.roomId) === Number(message.roomId || 0) || !message.roomId)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("chat:new", handleNewMessage);

    return () => {
      socket.off("chat:new", handleNewMessage);
      socket.disconnect();
    };
  }, [socket, user?.id, activeThread]);

  const selectConversation = useCallback((item) => {
    setActiveThread(toThread(item));
  }, []);

  const sendMessage = useCallback(async () => {
    if (!activeThread?.peerId || !content.trim()) {
      setError("Vui lòng chọn hội thoại và nhập nội dung");
      return false;
    }

    try {
      await chatService.sendMessage({
        receiverId: Number(activeThread.peerId),
        roomId: activeThread.roomId || undefined,
        content: content.trim(),
      });
      setContent("");
      setError("");
      await Promise.all([loadInbox(), loadMessages(activeThread)]);
      return true;
    } catch (err) {
      setError(getApiMessage(err, "Không gửi được tin nhắn"));
      return false;
    }
  }, [activeThread, content, loadInbox, loadMessages]);

  return {
    user,
    inbox,
    activeThread,
    messages,
    content,
    setContent,
    error,
    sendMessage,
    selectConversation,
    refreshInbox: loadInbox,
    hasActiveConversation: Boolean(activeThread?.peerId),
    isOwnMessage: (message) => Number(message.senderId) === Number(user?.id),
    isThreadActive: (item) => isSameThread(activeThread, toThread(item)),
  };
};

export default useChatConversation;
