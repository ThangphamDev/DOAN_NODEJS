import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import chatService from "@/services/ChatService";
import { useNotify } from "@/context/NotifyContext.jsx";
import useAuth from "@/hooks/useAuth";
import { getApiData, getApiMessage } from "@/utils/apiResponse";
import { getToken } from "@/utils/storage";

const toThread = (item = {}) => ({
  peerId: item.peerId ? Number(item.peerId) : null,
  peerName: item.peerName || (item.peerId ? `User ${item.peerId}` : ""),
  peerEmail: item.peerEmail || "",
  roomId: item.roomId ? Number(item.roomId) : null,
  roomTitle: item.roomTitle || "",
  blockedByMe: Boolean(item.blockedByMe),
  unreadCount: Number(item.unreadCount || 0),
});

const isSameThread = (left, right) =>
  Number(left?.peerId) === Number(right?.peerId) && Number(left?.roomId || 0) === Number(right?.roomId || 0);

const MESSAGE_PAGE_SIZE = 10;

const useChatConversation = () => {
  const { user } = useAuth();
  const notify = useNotify();
  const [inbox, setInbox] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const activeThreadRef = useRef(null);

  const socket = useMemo(() => {
    const token = getToken();
    if (!token) return null;

    return io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  }, []);

  const appendMessage = useCallback((message) => {
    setMessages((prev) => {
      if (prev.some((item) => Number(item.id) === Number(message.id))) {
        return prev;
      }

      return [...prev, message];
    });
  }, []);

  const upsertInboxItem = useCallback(
    (message, previousInbox) => {
      const peerId = Number(message.senderId) === Number(user?.id) ? Number(message.receiverId) : Number(message.senderId);
      const roomId = message.roomId ? Number(message.roomId) : null;
      const nextThread = { peerId, roomId };
      const matched = previousInbox.find((item) => isSameThread(item, nextThread));
      const activeMatched = isSameThread(activeThreadRef.current, nextThread) ? activeThreadRef.current : null;
      const isIncoming = Number(message.senderId) !== Number(user?.id);
      const isActiveThread = isSameThread(activeThreadRef.current, nextThread);
      const peerPayload = Number(message.senderId) === Number(user?.id) ? message.receiver : message.sender;

      const nextItem = {
        peerId,
        peerName:
          matched?.peerName ||
          activeMatched?.peerName ||
          peerPayload?.fullName ||
          peerPayload?.email ||
          `User ${peerId}`,
        peerEmail: matched?.peerEmail || activeMatched?.peerEmail || peerPayload?.email || "",
        lastMessage: message.content,
        lastMessageAt: message.createdAt,
        lastSenderId: message.senderId,
        roomId,
        roomTitle: matched?.roomTitle || activeMatched?.roomTitle || message.roomTitle || message.room?.title || "",
        blockedByMe: Boolean(matched?.blockedByMe || activeMatched?.blockedByMe),
        unreadCount: isIncoming
          ? (isActiveThread ? 0 : Number(matched?.unreadCount || 0) + 1)
          : Number(matched?.unreadCount || 0),
      };

      return [nextItem, ...previousInbox.filter((item) => !isSameThread(item, nextThread))];
    },
    [user?.id]
  );

  const clearThreadUnreadCount = useCallback((thread) => {
    setInbox((prev) =>
      prev.map((item) => {
        if (!isSameThread(item, thread) || Number(item.unreadCount || 0) === 0) {
          return item;
        }

        return {
          ...item,
          unreadCount: 0,
        };
      })
    );

    setActiveThread((prev) => {
      if (!isSameThread(prev, thread)) {
        return prev;
      }

      if (Number(prev?.unreadCount || 0) === 0) {
        return prev;
      }

      return {
        ...prev,
        unreadCount: 0,
      };
    });
  }, []);

  const markThreadAsRead = useCallback(
    async (thread, options = {}) => {
      if (!thread?.peerId) return;

      clearThreadUnreadCount(thread);

      try {
        await chatService.markConversationAsRead(thread.peerId, thread.roomId || undefined);
      } catch (err) {
        if (!options.silent) {
          notify.error(getApiMessage(err, "Không cập nhật được trạng thái đã đọc"));
        }
      }
    },
    [clearThreadUnreadCount, notify]
  );

  const loadInbox = useCallback(async () => {
    try {
      const response = await chatService.getInbox();
      const items = getApiData(response, []);
      setInbox(items);
      setError("");
      setActiveThread((prev) => {
        if (!items.length) return null;
        if (prev?.peerId) {
          const matched = items.find((item) => isSameThread(item, prev));
          if (matched) {
            return {
              ...toThread(matched),
              peerName: prev.peerName || matched.peerName,
              peerEmail: prev.peerEmail || matched.peerEmail || "",
              roomTitle: prev.roomTitle || matched.roomTitle || "",
              blockedByMe: prev.blockedByMe ?? matched.blockedByMe ?? false,
            };
          }
        }
        return toThread(items[0]);
      });
    } catch (err) {
      const message = getApiMessage(err, "Không tải được danh sách hội thoại");
      setError(message);
      notify.error(message);
    }
  }, [notify]);

  const loadMessages = useCallback(
    async (thread, options = {}) => {
      if (!thread?.peerId) {
        setMessages([]);
        setHasMoreMessages(false);
        return;
      }

      try {
        const requestThread = toThread(thread);
        const isLoadingOlder = Boolean(options.beforeId);
        if (isLoadingOlder) {
          setIsLoadingOlderMessages(true);
        } else {
          setIsLoadingMessages(true);
          setMessages([]);
          setHasMoreMessages(false);
        }

        const response = await chatService.getConversation(thread.peerId, thread.roomId || undefined, {
          limit: MESSAGE_PAGE_SIZE,
          beforeId: options.beforeId,
        });
        const payload = getApiData(response, { items: [], hasMore: false });
        const nextItems = Array.isArray(payload) ? payload : payload.items || [];
        const nextHasMore = Array.isArray(payload) ? false : Boolean(payload.hasMore);

        if (!isSameThread(activeThreadRef.current, requestThread)) {
          return;
        }

        setMessages((prev) => {
          if (!isLoadingOlder) {
            return nextItems;
          }

          const seenIds = new Set(prev.map((item) => Number(item.id)));
          const olderItems = nextItems.filter((item) => !seenIds.has(Number(item.id)));
          return [...olderItems, ...prev];
        });
        setHasMoreMessages(nextHasMore);
        setError("");
      } catch (err) {
        const message = getApiMessage(err, "Không tải được hội thoại");
        setError(message);
        notify.error(message);
      } finally {
        setIsLoadingMessages(false);
        setIsLoadingOlderMessages(false);
      }
    },
    [notify]
  );

  const loadOlderMessages = useCallback(async () => {
    const thread = activeThreadRef.current;
    const oldestMessageId = messages[0]?.id;

    if (!thread?.peerId || !oldestMessageId || !hasMoreMessages || isLoadingOlderMessages) {
      return false;
    }

    await loadMessages(thread, { beforeId: oldestMessageId });
    return true;
  }, [hasMoreMessages, isLoadingOlderMessages, loadMessages, messages]);

  useEffect(() => {
    activeThreadRef.current = activeThread;
  }, [activeThread]);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    loadMessages(activeThread);
  }, [activeThread, loadMessages]);

  useEffect(() => {
    if (!activeThread?.peerId) return;
    void markThreadAsRead(activeThread, { silent: true });
  }, [activeThread, markThreadAsRead]);

  useEffect(() => {
    if (!socket) return undefined;

    if (!socket.connected) {
      socket.connect();
    }

    const handleNewMessage = (message) => {
      const messagePeerId = Number(message.senderId) === Number(user?.id) ? Number(message.receiverId) : Number(message.senderId);
      const nextThread = {
        peerId: messagePeerId,
        roomId: message.roomId ? Number(message.roomId) : null,
      };

      setInbox((prev) => upsertInboxItem(message, prev));

      if (isSameThread(activeThreadRef.current, nextThread)) {
        appendMessage(message);
        if (Number(message.senderId) !== Number(user?.id)) {
          void markThreadAsRead(nextThread, { silent: true });
        }
      }
    };

    socket.on("chat:new", handleNewMessage);

    return () => {
      socket.off("chat:new", handleNewMessage);
    };
  }, [appendMessage, markThreadAsRead, socket, upsertInboxItem, user?.id]);

  useEffect(() => {
    if (!socket) return undefined;

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const selectConversation = useCallback((item) => {
    const nextThread = toThread(item);
    clearThreadUnreadCount(nextThread);
    setActiveThread(nextThread);
  }, [clearThreadUnreadCount]);

  const setThreadBlockedState = useCallback((peerId, blockedByMe) => {
    setInbox((prev) =>
      prev.map((item) =>
        Number(item.peerId) === Number(peerId)
          ? {
              ...item,
              blockedByMe,
            }
          : item
      )
    );

    setActiveThread((prev) => {
      if (!prev || Number(prev.peerId) !== Number(peerId)) {
        return prev;
      }

      return {
        ...prev,
        blockedByMe,
      };
    });
  }, []);

  const sendMessage = useCallback(async () => {
    if (!activeThread?.peerId || !content.trim()) {
      const message = "Vui lòng chọn hội thoại và nhập nội dung";
      setError(message);
      notify.warning(message);
      return false;
    }

    if (activeThread?.blockedByMe) {
      const message = "Bạn đã chặn người dùng này. Hãy mở chặn trước khi gửi tin nhắn.";
      setError(message);
      notify.warning(message);
      return false;
    }

    try {
      const response = await chatService.sendMessage({
        receiverId: Number(activeThread.peerId),
        roomId: activeThread.roomId || undefined,
        content: content.trim(),
      });
      const message = getApiData(response, null);

      if (message) {
        appendMessage(message);
        setInbox((prev) => upsertInboxItem(message, prev));
      }

      setContent("");
      setError("");
      return true;
    } catch (err) {
      const message = getApiMessage(err, "Không gửi được tin nhắn");
      setError(message);
      notify.error(message);
      return false;
    }
  }, [activeThread, appendMessage, content, notify, upsertInboxItem]);

  return {
    user,
    inbox,
    activeThread,
    messages,
    hasMoreMessages,
    isLoadingMessages,
    isLoadingOlderMessages,
    content,
    setContent,
    error,
    sendMessage,
    loadOlderMessages,
    selectConversation,
    refreshInbox: loadInbox,
    markThreadAsRead,
    setThreadBlockedState,
    hasActiveConversation: Boolean(activeThread?.peerId),
    isOwnMessage: (message) => Number(message.senderId) === Number(user?.id),
    isThreadActive: (item) => isSameThread(activeThread, toThread(item)),
  };
};

export default useChatConversation;
