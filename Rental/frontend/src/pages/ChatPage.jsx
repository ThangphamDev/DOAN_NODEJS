import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useChatConversation from "@/hooks/useChatConversation";

const formatMessageTime = (value) => {
  if (!value) return "";

  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ChatPage = () => {
  const {
    user,
    inbox,
    activeThread,
    messages,
    hasMoreMessages,
    isLoadingMessages,
    isLoadingOlderMessages,
    content,
    setContent,
    sendMessage,
    loadOlderMessages,
    selectConversation,
    hasActiveConversation,
    isOwnMessage,
    isThreadActive,
  } = useChatConversation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileTab, setMobileTab] = useState("inbox"); // 'inbox' | 'chat'
  const messagesContainerRef = useRef(null);
  const previousThreadKeyRef = useRef("");
  const previousLastMessageIdRef = useRef(null);
  const previousMessageCountRef = useRef(0);
  const pendingOlderScrollRef = useRef(null);
  const shouldScrollToBottomRef = useRef(false);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const threadKey = `${activeThread?.peerId || 0}-${activeThread?.roomId || 0}`;
    const pendingSnapshot = pendingOlderScrollRef.current;
    const currentLastMessageId = messages.length ? Number(messages[messages.length - 1]?.id || 0) : null;

    if (pendingSnapshot) {
      container.scrollTop = pendingSnapshot.scrollTop + (container.scrollHeight - pendingSnapshot.scrollHeight);
      pendingOlderScrollRef.current = null;
    } else if (previousThreadKeyRef.current !== threadKey) {
      shouldScrollToBottomRef.current = true;
    } else if (shouldScrollToBottomRef.current && !isLoadingMessages && messages.length > 0) {
      container.scrollTop = container.scrollHeight;
      shouldScrollToBottomRef.current = false;
    } else if (
      previousThreadKeyRef.current === threadKey &&
      !isLoadingMessages &&
      !isLoadingOlderMessages &&
      messages.length > previousMessageCountRef.current &&
      currentLastMessageId &&
      previousLastMessageIdRef.current &&
      currentLastMessageId !== previousLastMessageIdRef.current
    ) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }

    previousThreadKeyRef.current = threadKey;
    previousLastMessageIdRef.current = currentLastMessageId;
    previousMessageCountRef.current = messages.length;
  }, [activeThread, isLoadingMessages, isLoadingOlderMessages, messages]);

  const handleMessagesScroll = useCallback(async () => {
    const container = messagesContainerRef.current;
    if (!container || container.scrollTop > 80 || !hasMoreMessages || isLoadingOlderMessages) {
      return;
    }

    pendingOlderScrollRef.current = {
      scrollHeight: container.scrollHeight,
      scrollTop: container.scrollTop,
    };
    await loadOlderMessages();
  }, [hasMoreMessages, isLoadingOlderMessages, loadOlderMessages]);

  const filteredInbox = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return inbox;

    return inbox.filter((item) => {
      const haystack = `${item.peerName} ${item.peerEmail || ""} ${item.lastMessage || ""}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [inbox, searchQuery]);

  const handleComposerKeyDown = async (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await sendMessage();
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl px-4 py-6 md:px-6">
      {/* Mobile tab switcher */}
      <div className="mb-0 flex w-full md:hidden" style={{ display: 'none' }} />
      <div className="flex h-[calc(100vh-12rem)] min-h-[38rem] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Mobile tab bar — above the panel, shown only on small screens via CSS */}
        <aside className={`h-full min-h-0 w-full shrink-0 flex-col border-r border-slate-200 bg-white md:flex md:w-80 ${mobileTab === 'inbox' ? 'flex' : 'hidden'} md:flex`}>
          <div className="flex items-center gap-3 border-b border-slate-200 p-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined">forum</span>
            </div>
            <div>
              <h1 className="text-sm font-bold">Trung tâm nhắn tin</h1>
              <p className="text-xs text-slate-500">Trao đổi trực tiếp với chủ trọ</p>
            </div>
          </div>

          <div className="border-b border-slate-100 p-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">search</span>
              <input
                className="w-full rounded-lg border-none bg-background-light pl-10 text-sm focus:ring-primary"
                placeholder="Tìm hội thoại..."
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>

          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
            {filteredInbox.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">Bạn chưa có hội thoại nào.</div>
            ) : (
              filteredInbox.map((item) => {
                const isActive = isThreadActive(item);
                return (
                  <button
                    key={`${item.peerId}-${item.roomId || 0}`}
                    className={`flex w-full cursor-pointer items-center gap-3 border-b border-slate-100 p-4 text-left transition-colors ${
                      isActive ? "border-l-4 border-l-primary bg-primary/10" : "hover:bg-slate-50"
                    }`}
                    type="button"
                    onClick={() => { selectConversation(item); setMobileTab("chat"); }}
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-primary">
                      {(item.peerName || "C").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="flex justify-between gap-2">
                        <h3 className="truncate text-sm font-semibold">{item.peerName}</h3>
                        <span className={`shrink-0 text-[10px] ${isActive ? "font-medium text-primary" : "text-slate-400"}`}>
                          {formatMessageTime(item.lastMessageAt)}
                        </span>
                      </div>
                      <p className={`truncate text-xs ${item.lastSenderId === user?.id ? "text-slate-500" : "font-medium text-slate-700"}`}>
                        {item.lastSenderId === user?.id ? `Bạn: ${item.lastMessage}` : item.lastMessage}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-slate-400">
                        {item.roomTitle || (item.roomId ? `Tin đăng #${item.roomId}` : "Hội thoại chung")}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          {/* Mobile: switch to chat */}
          {hasActiveConversation ? (
            <button
              className="mx-4 mb-4 flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 py-2.5 text-sm font-bold text-primary md:hidden"
              type="button"
              onClick={() => setMobileTab('chat')}
            >
              <span className="material-symbols-outlined text-base">chat</span>
              Xem tin nhắn với {activeThread?.peerName}
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          ) : null}
        </aside>

        <main className={`min-h-0 min-w-0 flex-1 flex-col bg-white ${mobileTab === 'chat' ? 'flex' : 'hidden'} md:flex`}>
          <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md md:px-6">
            <div className="min-w-0 flex items-center gap-3">
              {/* Mobile back button */}
              <button
                className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 md:hidden"
                type="button"
                onClick={() => setMobileTab("inbox")}
              >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
              </button>
              <div className="relative shrink-0">
                <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 font-bold text-primary">
                  {(activeThread?.peerName || "C").slice(0, 1).toUpperCase()}
                </div>
                {hasActiveConversation ? <div className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-green-500"></div> : null}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold">{activeThread?.peerName || "Chọn một hội thoại"}</h2>
                <p className="truncate text-xs font-semibold text-primary">
                  {activeThread?.roomTitle || (activeThread?.roomId ? `Tin đăng #${activeThread.roomId}` : activeThread?.peerEmail || "Hội thoại trực tiếp")}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100" type="button">
                <span className="material-symbols-outlined">call</span>
              </button>
              <button className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100" type="button">
                <span className="material-symbols-outlined">info</span>
              </button>
            </div>
          </header>

          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-4 md:p-6" ref={messagesContainerRef} onScroll={handleMessagesScroll}>
            <div className="flex min-h-full flex-col gap-6">
              {hasActiveConversation ? (
                <div className="flex justify-center">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">Hôm nay</span>
                </div>
              ) : null}

              {hasActiveConversation && isLoadingOlderMessages ? (
                <div className="flex justify-center">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">Đang tải thêm tin nhắn cũ...</span>
                </div>
              ) : null}

              {hasActiveConversation && !isLoadingOlderMessages && hasMoreMessages ? (
                <div className="flex justify-center">
                  <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-400">Cuộn lên để xem 10 tin cũ hơn</span>
                </div>
              ) : null}

              {!hasActiveConversation ? (
                <div className="flex flex-1 items-center justify-center text-sm text-slate-500">Chọn một cuộc trò chuyện để bắt đầu nhắn tin.</div>
              ) : isLoadingMessages ? (
                <div className="flex flex-1 items-center justify-center text-sm text-slate-500">Đang tải 10 tin nhắn gần nhất...</div>
              ) : messages.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-sm text-slate-500">Chưa có tin nhắn trong hội thoại này.</div>
              ) : (
                messages.map((item, index) => {
                  const ownMessage = isOwnMessage(item);
                  return ownMessage ? (
                    <div className="flex max-w-[min(80%,42rem)] flex-col items-end gap-1 self-end" key={item.id || `${item.senderId}-${index}`}>
                      <div className="max-h-48 overflow-y-auto break-words rounded-xl rounded-br-none bg-primary p-4 text-sm leading-relaxed text-white shadow-md shadow-primary/20">
                        {item.content}
                      </div>
                      <div className="mr-1 flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">{formatMessageTime(item.createdAt) || "Vừa xong"}</span>
                        <span className="material-symbols-outlined text-[14px] text-primary">done_all</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex max-w-[min(80%,42rem)] items-end gap-3" key={item.id || `${item.senderId}-${index}`}>
                      <div className="mb-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-primary">
                        {(activeThread?.peerName || "C").slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="max-h-48 overflow-y-auto break-words rounded-xl rounded-bl-none bg-slate-100 p-4 text-sm leading-relaxed text-slate-800 shadow-sm">
                          {item.content}
                        </div>
                        <span className="ml-1 text-[10px] text-slate-400">{formatMessageTime(item.createdAt) || "Vừa xong"}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white p-4 md:p-6">
            <div className="flex items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 transition-all focus-within:ring-2 focus-within:ring-primary/20">
              <button className="hidden p-2 text-slate-400 transition-colors hover:text-primary sm:block" type="button">
                <span className="material-symbols-outlined">add_circle</span>
              </button>
              <textarea
                className="max-h-32 flex-1 resize-none border-none bg-transparent px-0 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-0"
                placeholder="Nhập tin nhắn..."
                rows="1"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                onKeyDown={handleComposerKeyDown}
              />
              <button
                className="flex size-10 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={sendMessage}
                disabled={!hasActiveConversation}
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
            <div className="mt-2 flex justify-center">
              <p className="text-[10px] text-slate-400">Nhấn Enter để gửi, Shift + Enter để xuống dòng</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
