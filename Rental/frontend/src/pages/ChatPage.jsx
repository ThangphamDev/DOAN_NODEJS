import { useMemo, useState } from "react";
import useChatConversation from "@/hooks/useChatConversation";

const ChatPage = () => {
  const {
    user,
    inbox,
    activeThread,
    messages,
    content,
    setContent,
    error,
    sendMessage,
    selectConversation,
    hasActiveConversation,
    isOwnMessage,
    isThreadActive,
  } = useChatConversation();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInbox = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return inbox;
    return inbox.filter((item) => {
      const haystack = `${item.peerName} ${item.peerEmail || ""} ${item.lastMessage || ""}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [inbox, searchQuery]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-7xl px-4 py-6 md:px-6">
      <div className="flex w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <aside className="flex w-80 shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-200 p-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined">apartment</span>
            </div>
            <div>
              <h1 className="text-sm font-bold">Renter Portal</h1>
              <p className="text-xs text-slate-500">Messaging Hub</p>
            </div>
          </div>

          <div className="p-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">search</span>
              <input
                className="w-full rounded-lg border-none bg-background-light pl-10 text-sm focus:ring-primary"
                placeholder="Tìm chủ trọ..."
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredInbox.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">Bạn chưa có hội thoại nào.</div>
            ) : (
              filteredInbox.map((item) => {
                const isActive = isThreadActive(item);
                return (
                  <button
                    key={`${item.peerId}-${item.roomId || 0}`}
                    className={`flex w-full cursor-pointer items-center gap-3 p-4 text-left transition-colors ${isActive ? "border-l-4 border-l-primary bg-primary/10" : "hover:bg-slate-50"}`}
                    type="button"
                    onClick={() => selectConversation(item)}
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-primary">
                      {(item.peerName || "C").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <h3 className="truncate text-sm font-semibold">{item.peerName}</h3>
                        <span className={`text-[10px] ${isActive ? "font-medium text-primary" : "text-slate-400"}`}>
                          {item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>
                      <p className={`truncate text-xs ${item.lastSenderId === user?.id ? "text-slate-500" : "font-medium text-slate-700"}`}>
                        {item.lastSenderId === user?.id ? `Bạn: ${item.lastMessage}` : item.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-slate-100 font-bold text-primary">
                {(user?.fullName || user?.email || "A").slice(0, 1).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{user?.fullName || user?.email || "Khách"}</span>
            </div>
            <button className="text-slate-400 transition-colors hover:text-slate-600" type="button">
              <span className="material-symbols-outlined text-xl">settings</span>
            </button>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col bg-white">
          <header className="z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 font-bold text-primary">
                  {(activeThread?.peerName || "C").slice(0, 1).toUpperCase()}
                </div>
                {hasActiveConversation && <div className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-green-500"></div>}
              </div>
              <div>
                <h2 className="text-base font-bold">{activeThread?.peerName || "Chọn một hội thoại"}</h2>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {activeThread?.roomId ? `Chủ trọ • Tin đăng #${activeThread.roomId}` : activeThread?.peerEmail || "Landlord"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100" type="button">
                <span className="material-symbols-outlined">call</span>
              </button>
              <button className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100" type="button">
                <span className="material-symbols-outlined">videocam</span>
              </button>
              <button className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100" type="button">
                <span className="material-symbols-outlined">info</span>
              </button>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
            {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

            {hasActiveConversation && (
              <div className="flex justify-center">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">Hôm nay</span>
              </div>
            )}

            {!hasActiveConversation ? (
              <div className="flex flex-1 items-center justify-center text-sm text-slate-500">Chọn một cuộc trò chuyện để bắt đầu nhắn tin.</div>
            ) : messages.length === 0 ? (
              <div className="flex flex-1 items-center justify-center text-sm text-slate-500">Chưa có tin nhắn trong hội thoại này.</div>
            ) : (
              messages.map((item) => {
                const ownMessage = isOwnMessage(item);
                return ownMessage ? (
                  <div className="flex max-w-[70%] flex-col items-end gap-1 self-end" key={item.id}>
                    <div className="rounded-xl rounded-br-none bg-primary p-4 text-sm leading-relaxed text-white shadow-md shadow-primary/20">
                      {item.content}
                    </div>
                    <div className="mr-1 flex items-center gap-1">
                      <span className="text-[10px] text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Vừa xong"}</span>
                      <span className="material-symbols-outlined text-[14px] text-primary">done_all</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex max-w-[70%] items-end gap-3" key={item.id}>
                    <div className="mb-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-primary">
                      {(activeThread?.peerName || "C").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="rounded-xl rounded-bl-none bg-slate-100 p-4 text-sm leading-relaxed text-slate-800 shadow-sm">
                        {item.content}
                      </div>
                      <span className="ml-1 text-[10px] text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Vừa xong"}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="bg-white p-6">
            <div className="flex items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 transition-all focus-within:ring-2 focus-within:ring-primary/20">
              <button className="p-2 text-slate-400 transition-colors hover:text-primary" type="button">
                <span className="material-symbols-outlined">add_circle</span>
              </button>
              <button className="p-2 text-slate-400 transition-colors hover:text-primary" type="button">
                <span className="material-symbols-outlined">mood</span>
              </button>
              <textarea
                className="max-h-32 flex-1 resize-none border-none bg-transparent px-0 py-2 text-sm focus:ring-0"
                placeholder="Nhập tin nhắn..."
                rows="1"
                value={content}
                onChange={(event) => setContent(event.target.value)}
              />
              <button className="flex size-10 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={sendMessage} disabled={!hasActiveConversation}>
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
            <div className="mt-2 flex justify-center">
              <p className="text-[10px] text-slate-400">Nhấn Shift + Enter để xuống dòng</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
