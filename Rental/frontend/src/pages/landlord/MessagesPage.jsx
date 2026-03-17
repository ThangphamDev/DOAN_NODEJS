import { useEffect, useMemo, useState } from "react";
import landlordService from "@/services/LandlordService";
import useChatConversation from "@/hooks/useChatConversation";
import { getApiData } from "@/utils/apiResponse";

const MessagesPage = () => {
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
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadRooms = async () => {
      try {
        const response = await landlordService.getMyRooms();
        if (!isMounted) return;
        setRooms(getApiData(response, []));
      } catch {
        if (!isMounted) return;
        setRooms([]);
      }
    };

    loadRooms();

    return () => {
      isMounted = false;
    };
  }, []);

  const uploadBaseUrl = useMemo(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    return apiBaseUrl.replace(/\/api\/?$/, "");
  }, []);

  const activeRoom = useMemo(
    () => rooms.find((room) => Number(room.id) === Number(activeThread?.roomId)),
    [rooms, activeThread?.roomId]
  );

  const activeRoomImage = useMemo(() => {
    const imageUrl = activeRoom?.images?.[0]?.imageUrl || "";
    if (!imageUrl) return "";
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    return `${uploadBaseUrl}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
  }, [activeRoom?.images, uploadBaseUrl]);

  const filteredInbox = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return inbox;
    return inbox.filter((item) => {
      const haystack = `${item.peerName} ${item.peerEmail || ""} ${item.lastMessage || ""}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [inbox, searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-extrabold tracking-tight">Tin nhắn khách thuê</h2>
          <p className="text-slate-500">Dùng mẫu messenger manager mới cho khu chủ trọ, giữ nguyên dữ liệu thật từ inbox và socket.</p>
        </div>
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            className="w-full rounded-xl border-none bg-white py-3 pl-10 pr-4 text-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-primary/40"
            placeholder="Tìm kiếm khách thuê hoặc nội dung..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            type="text"
          />
        </div>
      </div>

      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <aside className="flex w-80 shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-4">
            <div className="flex gap-2">
              <button className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white" type="button">Tất cả</button>
              <button className="flex-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600" type="button">Chưa đọc</button>
              <button className="flex-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600" type="button">Ưu tiên</button>
            </div>
          </div>

          <div className="custom-scrollbar flex-1 overflow-y-auto">
            {filteredInbox.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">Chưa có hội thoại nào phù hợp.</div>
            ) : (
              filteredInbox.map((item) => {
                const isActive = isThreadActive(item);
                return (
                  <button
                    key={`${item.peerId}-${item.roomId || 0}`}
                    className={`flex w-full items-center gap-3 border-b border-slate-50 p-4 text-left transition-colors ${
                      isActive ? "border-l-4 border-l-primary bg-primary/10" : "hover:bg-slate-50"
                    }`}
                    type="button"
                    onClick={() => selectConversation(item)}
                  >
                    <div className="relative shrink-0">
                      <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 font-bold text-primary">
                        {(item.peerName || "K").slice(0, 1).toUpperCase()}
                      </div>
                      {item.lastSenderId !== user?.id && (
                        <div className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">1</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-baseline justify-between gap-2">
                        <h4 className={`truncate text-sm ${isActive ? "font-bold" : "font-semibold text-slate-700"}`}>{item.peerName}</h4>
                        <span className={`text-[10px] ${isActive ? "font-medium text-primary" : "text-slate-400"}`}>
                          {item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>
                      <p className={`truncate text-xs ${item.lastSenderId === user?.id ? "text-slate-500" : "font-bold text-slate-900"}`}>
                        {item.lastSenderId === user?.id ? `Bạn: ${item.lastMessage}` : item.lastMessage}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                        <span className="material-symbols-outlined text-xs">home_work</span>
                        <span className="truncate">{item.roomId ? `Tin đăng #${item.roomId}` : "Chưa gắn với phòng cụ thể"}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col bg-slate-50">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 font-bold text-primary">
                {(activeThread?.peerName || "K").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold leading-none">{activeThread?.peerName || "Chọn một hội thoại"}</h3>
                <p className="mt-1 text-xs text-slate-500">{activeThread?.peerEmail || "Khách thuê tiềm năng"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary" type="button">
                <span className="material-symbols-outlined text-lg">calendar_today</span>
                Đặt lịch xem
              </button>
              <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600" type="button">
                <span className="material-symbols-outlined">call</span>
              </button>
              <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600" type="button">
                <span className="material-symbols-outlined">info</span>
              </button>
            </div>
          </header>

          <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-6">
            {hasActiveConversation ? (
              <div className="flex justify-center">
                <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Hôm nay</span>
              </div>
            ) : null}

            {!hasActiveConversation ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">Chọn một hội thoại ở cột bên trái để bắt đầu làm việc.</div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">Chưa có tin nhắn nào trong hội thoại này.</div>
            ) : (
              messages.map((item) => {
                const ownMessage = isOwnMessage(item);
                return (
                  <div key={item.id} className={`flex max-w-[80%] items-end gap-3 ${ownMessage ? "ml-auto flex-row-reverse" : ""}`}>
                    {!ownMessage ? (
                      <div className="flex size-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                        {(activeThread?.peerName || "K").slice(0, 1).toUpperCase()}
                      </div>
                    ) : null}
                    <div className={`flex flex-col gap-1 ${ownMessage ? "items-end" : ""}`}>
                      <div
                        className={`p-3 text-sm leading-relaxed shadow-sm ${
                          ownMessage
                            ? "rounded-2xl rounded-br-none bg-primary text-white"
                            : "rounded-2xl rounded-bl-none border border-slate-100 bg-white"
                        }`}
                      >
                        <p>{item.content}</p>
                      </div>
                      <span className="px-1 text-[10px] text-slate-400">
                        {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Vừa xong"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <footer className="shrink-0 border-t border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-2 px-2">
              <button className="p-2 text-slate-400 transition-colors hover:text-primary" type="button">
                <span className="material-symbols-outlined">image</span>
              </button>
              <button className="p-2 text-slate-400 transition-colors hover:text-primary" type="button">
                <span className="material-symbols-outlined">attach_file</span>
              </button>
              <button className="p-2 text-slate-400 transition-colors hover:text-primary" type="button">
                <span className="material-symbols-outlined">mood</span>
              </button>
              <div className="mx-1 h-4 w-px bg-slate-200"></div>
              <button className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:text-primary" type="button">
                Tạo hợp đồng
              </button>
            </div>
            <div className="flex items-center gap-3">
              <textarea
                className="custom-scrollbar min-h-12 flex-1 resize-none rounded-xl border-none bg-slate-100 p-3 text-sm focus:ring-2 focus:ring-primary/50"
                placeholder="Nhập tin nhắn..."
                rows="1"
                value={content}
                onChange={(event) => setContent(event.target.value)}
              />
              <button
                className="flex size-11 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={sendMessage}
                disabled={!hasActiveConversation}
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </footer>
        </main>

        <aside className="custom-scrollbar hidden w-72 shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-white lg:flex">
          <div className="border-b border-slate-100 p-6">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Thông tin khách hàng</h4>
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex size-20 items-center justify-center rounded-full border-4 border-slate-50 bg-slate-100 text-2xl font-bold text-primary">
                {(activeThread?.peerName || "K").slice(0, 1).toUpperCase()}
              </div>
              <h3 className="text-base font-bold">{activeThread?.peerName || "Khách thuê"}</h3>
              <p className="mb-4 text-xs text-slate-500">{activeThread?.peerEmail || "Khách hàng tiềm năng"}</p>
              <div className="flex w-full gap-2">
                <button className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-bold transition-colors hover:bg-slate-50" type="button">Trang cá nhân</button>
                <button className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-bold transition-colors hover:bg-slate-50" type="button">Chặn</button>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Tin đăng đang quan tâm</h4>
            {activeRoom ? (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="relative h-32 bg-slate-200">
                  {activeRoomImage ? (
                    <img className="h-full w-full object-cover" src={activeRoomImage} alt={activeRoom.title} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                      <span className="material-symbols-outlined text-4xl">home_work</span>
                    </div>
                  )}
                  <div className="absolute right-2 top-2 rounded bg-primary px-2 py-1 text-[10px] font-bold text-white">
                    {activeRoom.status === "rented" ? "ĐÃ THUÊ" : activeRoom.status === "hidden" ? "ĐÃ ẨN" : "TRỐNG"}
                  </div>
                </div>
                <div className="p-4">
                  <h5 className="truncate text-sm font-bold">{activeRoom.title}</h5>
                  <p className="mt-1 text-xs font-bold text-primary">{Number(activeRoom.price || 0).toLocaleString("vi-VN")}đ / tháng</p>
                  <div className="mt-3 space-y-2 text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">square_foot</span>
                      {activeRoom.area || "Đang cập nhật"}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      <span className="truncate">{activeRoom.address || "Chưa có địa chỉ"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">reviews</span>
                      {activeRoom.reviews?.length || 0} đánh giá
                    </div>
                  </div>
                  <a
                    className="mt-4 block w-full rounded-lg bg-slate-100 py-2 text-center text-xs font-bold text-slate-700 transition-colors hover:bg-primary hover:text-white"
                    href={`/rooms/${activeRoom.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Xem chi tiết tin đăng
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">Chưa có thông tin phòng gắn với hội thoại hiện tại.</div>
            )}

            <div className="mt-8">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Ghi chú</h4>
              <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-3">
                <p className="text-[11px] italic leading-relaxed text-yellow-800">
                  {hasActiveConversation ? "Khách này đang được theo dõi trong kênh nhắn tin trực tiếp. Ưu tiên chốt lịch xem nếu phản hồi nhanh." : "Chưa có ghi chú cho khách này."}
                </p>
              </div>
              <button className="mt-2 flex w-full items-center justify-center gap-1 text-xs font-bold text-primary" type="button">
                <span className="material-symbols-outlined text-sm">add_circle</span>
                Thêm ghi chú
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MessagesPage;
