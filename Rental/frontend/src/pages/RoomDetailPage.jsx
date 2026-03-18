import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import LoadingState from "@/components/common/LoadingState";
import ReportRoomModal from "@/components/room/ReportRoomModal";
import { useNotify } from "@/context/NotifyContext.jsx";
import useAuth from "@/hooks/useAuth";
import chatService from "@/services/ChatService";
import roomService from "@/services/RoomService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";
import { getToken } from "@/utils/storage";

const amenityItems = [
  { icon: "wifi", label: "Wifi tốc độ cao" },
  { icon: "ac_unit", label: "Máy lạnh" },
  { icon: "local_parking", label: "Chỗ để xe" },
  { icon: "fitness_center", label: "Không gian thoáng" },
  { icon: "local_laundry_service", label: "Khu giặt phơi" },
  { icon: "security", label: "An ninh 24/7" },
];

const formatMessageTime = (value) => {
  if (!value) return "Vừa xong";

  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const notify = useNotify();
  const [room, setRoom] = useState(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [phone, setPhone] = useState("");
  const [leaseTerm, setLeaseTerm] = useState("12 tháng");
  const [review, setReview] = useState({ rating: 5, content: "" });
  const [chatContent, setChatContent] = useState("");
  const [showChatComposer, setShowChatComposer] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const chatEndRef = useRef(null);

  const socket = useMemo(() => {
    const token = getToken();
    if (!token) return null;

    return io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  }, []);

  const uploadBaseUrl = useMemo(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    return apiBaseUrl.replace(/\/api\/?$/, "");
  }, []);

  const roomImages = useMemo(() => {
    const images = room?.images || [];

    return images
      .map((image) => {
        const imageUrl = image?.imageUrl || "";
        if (!imageUrl) return "";
        if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
        return `${uploadBaseUrl}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
      })
      .filter(Boolean);
  }, [room?.images, uploadBaseUrl]);

  const averageRating = useMemo(() => {
    const reviews = room?.reviews || [];
    if (!reviews.length) return "0.0";

    const total = reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  }, [room?.reviews]);

  const photoGrid = useMemo(() => {
    const fallback = "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80";
    const images = roomImages.length ? roomImages : [fallback];
    return Array.from({ length: 5 }, (_, index) => images[index] || images[0]);
  }, [roomImages]);

  const appendChatMessage = useCallback((message) => {
    setChatMessages((prev) => {
      const exists = prev.some((item) => Number(item.id) === Number(message.id));
      if (exists) return prev;
      return [...prev, message];
    });
  }, []);

  const fetchRoom = useCallback(() => {
    roomService
      .getRoomDetail(id)
      .then((response) => {
        setRoom(getApiData(response));
      })
      .catch((err) => {
        notify.error(getApiMessage(err, "Không tải được thông tin phòng"));
      });
  }, [id, notify]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  const loadRoomConversation = useCallback(async () => {
    if (!room?.landlord?.id) return;

    try {
      setChatLoading(true);
      const response = await chatService.getConversation(room.landlord.id, room.id);
      setChatMessages(getApiData(response, []));
    } catch (err) {
      notify.error(getApiMessage(err, "Không tải được lịch sử tin nhắn"));
    } finally {
      setChatLoading(false);
    }
  }, [notify, room?.id, room?.landlord?.id]);

  useEffect(() => {
    if (!socket || !showChatComposer || !room?.landlord?.id) return undefined;

    if (!socket.connected) {
      socket.connect();
    }

    const handleNewMessage = (message) => {
      const isCurrentThread =
        ((Number(message.senderId) === Number(room.landlord.id) && Number(message.receiverId) === Number(user?.id)) ||
          (Number(message.senderId) === Number(user?.id) && Number(message.receiverId) === Number(room.landlord.id))) &&
        Number(message.roomId || 0) === Number(room.id || 0);

      if (!isCurrentThread) return;
      appendChatMessage(message);
    };

    socket.on("chat:new", handleNewMessage);

    return () => {
      socket.off("chat:new", handleNewMessage);
    };
  }, [appendChatMessage, room?.id, room?.landlord?.id, showChatComposer, socket, user?.id]);

  useEffect(() => {
    if (!showChatComposer) return;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatMessages, showChatComposer]);

  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  const addFavorite = async () => {
    try {
      await roomService.toggleFavorite(id);
      notify.success("Đã cập nhật danh sách yêu thích.");
    } catch (err) {
      notify.error(getApiMessage(err, "Không thể cập nhật yêu thích"));
    }
  };

  const bookVisit = async () => {
    if (!scheduledAt) {
      notify.warning("Vui lòng chọn thời gian xem phòng.");
      return;
    }
    
    if (!phone) {
      notify.warning("Vui lòng nhập số điện thoại liên hệ.");
      return;
    }
    
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      notify.warning("Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    try {
      await roomService.createAppointment(id, { scheduledAt, leaseTerm, phone });
      notify.success("Đã gửi lịch xem phòng thành công.");
      setScheduledAt("");
    } catch (err) {
      notify.error(getApiMessage(err, "Không thể đặt lịch xem phòng"));
    }
  };

  const submitReview = async () => {
    if (!review.content.trim()) {
      notify.warning("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    try {
      await roomService.createReview(id, review);
      setReview({ rating: 5, content: "" });
      notify.success("Đánh giá của bạn đã được ghi nhận.");
      fetchRoom();
    } catch (err) {
      notify.error(getApiMessage(err, "Không thể gửi đánh giá"));
    }
  };

  const submitRoomReport = async (payload) => {
    try {
      setIsReporting(true);
      await roomService.reportRoom(id, payload);
      notify.success("Đã gửi báo cáo bài đăng.");
      setShowReportModal(false);
    } catch (err) {
      notify.error(getApiMessage(err, "Không thể gửi báo cáo bài đăng"));
    } finally {
      setIsReporting(false);
    }
  };

  const sendMessageToLandlord = async () => {
    if (!room?.landlord?.id) {
      notify.error("Không xác định được chủ trọ của phòng này.");
      return;
    }

    if (!chatContent.trim()) {
      notify.warning("Vui lòng nhập nội dung tin nhắn.");
      return;
    }

    try {
      const response = await chatService.sendMessage({
        receiverId: room.landlord.id,
        roomId: room.id,
        content: chatContent.trim(),
      });
      const message = getApiData(response, null);
      if (message) {
        appendChatMessage(message);
      }
      setChatContent("");
    } catch (err) {
      notify.error(getApiMessage(err, "Không thể gửi tin nhắn"));
    }
  };

  const openChatPopup = async () => {
    setShowChatComposer(true);
    await loadRoomConversation();
  };

  const handlePopupKeyDown = async (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await sendMessageToLandlord();
    }
  };

  if (!room) return <LoadingState />;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 md:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          type="button"
          onClick={handleBack}
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Quay về
        </button>

        {user?.role === "customer" ? (
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            type="button"
            onClick={() => setShowReportModal(true)}
          >
            <span className="material-symbols-outlined text-lg">flag</span>
            Báo cáo bài đăng
          </button>
        ) : null}
      </div>

      <div className="mb-8 grid h-[360px] grid-cols-4 grid-rows-2 gap-3 overflow-hidden rounded-xl md:h-[500px]">
        <div
          className="col-span-4 row-span-2 bg-slate-200 md:col-span-2"
          style={{ backgroundImage: `url(${photoGrid[0]})`, backgroundPosition: "center", backgroundSize: "cover" }}
        ></div>
        <div className="hidden bg-slate-200 md:block" style={{ backgroundImage: `url(${photoGrid[1]})`, backgroundPosition: "center", backgroundSize: "cover" }}></div>
        <div className="hidden bg-slate-200 md:block" style={{ backgroundImage: `url(${photoGrid[2]})`, backgroundPosition: "center", backgroundSize: "cover" }}></div>
        <div className="hidden bg-slate-200 md:block" style={{ backgroundImage: `url(${photoGrid[3]})`, backgroundPosition: "center", backgroundSize: "cover" }}></div>
        <div className="relative hidden bg-slate-200 md:block" style={{ backgroundImage: `url(${photoGrid[4]})`, backgroundPosition: "center", backgroundSize: "cover" }}>
          {roomImages.length > 5 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-lg font-bold text-white">+{roomImages.length - 4} ảnh</div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="flex-1">
          <div className="mb-6 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">Đã xác minh</span>
              <span
                className={`rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                  room.status === "active"
                    ? "bg-green-500/10 text-green-600"
                    : room.status === "rented"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-slate-200 text-slate-700"
                }`}
              >
                {room.status === "active" ? "Còn trống" : room.status === "rented" ? "Đã thuê" : "Tạm ẩn"}
              </span>
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900">{room.title}</h1>
            <p className="flex items-center gap-1 text-slate-500">
              <span className="material-symbols-outlined text-base">location_on</span>
              {room.address || "Đang cập nhật địa chỉ"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-y border-slate-200 py-6 md:grid-cols-4">
            <div className="flex flex-col items-center rounded-lg bg-slate-100/60 p-3 text-center">
              <span className="material-symbols-outlined mb-1 text-primary">square_foot</span>
              <span className="font-bold text-slate-900">{room.area || "Đang cập nhật"}</span>
              <span className="text-xs text-slate-500">Diện tích</span>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-slate-100/60 p-3 text-center">
              <span className="material-symbols-outlined mb-1 text-primary">bed</span>
              <span className="font-bold text-slate-900">1 phòng</span>
              <span className="text-xs text-slate-500">Không gian</span>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-slate-100/60 p-3 text-center">
              <span className="material-symbols-outlined mb-1 text-primary">bathtub</span>
              <span className="font-bold text-slate-900">Tiện nghi cơ bản</span>
              <span className="text-xs text-slate-500">Sinh hoạt</span>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-slate-100/60 p-3 text-center">
              <span className="material-symbols-outlined mb-1 text-primary">event_available</span>
              <span className="font-bold text-slate-900">Linh hoạt</span>
              <span className="text-xs text-slate-500">Hợp đồng</span>
            </div>
          </div>

          <div className="py-8">
            <h3 className="mb-4 text-2xl font-bold text-slate-900">Mô tả</h3>
            <p className="text-lg leading-relaxed text-slate-600">
              {room.description || "Chủ trọ chưa cập nhật mô tả chi tiết cho phòng này. Bạn có thể nhắn trực tiếp để hỏi thêm thông tin, lịch xem và các điều khoản thuê."}
            </p>
          </div>

          <div className="border-t border-slate-200 py-8">
            <h3 className="mb-6 text-2xl font-bold text-slate-900">Tiện ích</h3>
            <div className="grid grid-cols-2 gap-y-4 md:grid-cols-3">
              {amenityItems.map((item) => (
                <div className="flex items-center gap-3" key={item.label}>
                  <span className="material-symbols-outlined text-primary">{item.icon}</span>
                  <span className="text-slate-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 py-8">
            <h3 className="mb-6 text-2xl font-bold text-slate-900">Vị trí</h3>
            <div className="relative h-80 w-full overflow-hidden rounded-xl bg-slate-200 shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-5xl text-primary drop-shadow-lg">location_on</span>
                <div className="mt-2 rounded bg-white px-3 py-1 text-sm font-bold shadow-md">{room.address || "Vị trí phòng trọ"}</div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 py-8">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900">Đánh giá ({(room.reviews || []).length})</h3>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined fill-1 text-yellow-500">star</span>
                <span className="text-xl font-bold text-slate-900">{averageRating}</span>
                <span className="ml-1 text-sm text-slate-500">Điểm trung bình</span>
              </div>
            </div>

            <div className="space-y-8">
              {(room.reviews || []).length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Chưa có đánh giá nào cho phòng này.</p>
              ) : (
                (room.reviews || []).map((item, index) => (
                  <div className={`${index > 0 ? "border-t border-slate-100 pt-8" : ""} flex flex-col gap-4`} key={item.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-700">
                          {(item.reviewer?.fullName || "K").slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.reviewer?.fullName || "Khách thuê"}</p>
                          <p className="text-xs text-slate-500">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "Mới đây"}
                          </p>
                        </div>
                      </div>
                      <div className="flex text-yellow-500">
                        {Array.from({ length: 5 }, (_, starIndex) => (
                          <span className="material-symbols-outlined text-sm" key={`${item.id}-${starIndex}`}>
                            {starIndex < Number(item.rating || 0) ? "star" : "star_outline"}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="italic text-slate-600">"{item.content || "Không có nội dung"}"</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {user?.role === "customer" ? (
            <div className="border-t border-slate-200 py-8">
              <h3 className="mb-6 text-2xl font-bold text-slate-900">Viết đánh giá</h3>
              <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  <span>Chấm điểm</span>
                  <select
                    className="rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    value={review.rating}
                    onChange={(event) => setReview((prev) => ({ ...prev, rating: Number(event.target.value) }))}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <option key={star} value={star}>{star} / 5</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  <span>Nhận xét</span>
                  <textarea
                    className="min-h-28 rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    value={review.content}
                    onChange={(event) => setReview((prev) => ({ ...prev, content: event.target.value }))}
                    placeholder="Chia sẻ trải nghiệm thực tế của bạn"
                  />
                </label>
                <button className="h-12 rounded-xl bg-primary px-5 text-sm font-bold text-white transition-all hover:bg-primary/90" type="button" onClick={submitReview}>
                  Gửi đánh giá
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="w-full lg:w-[400px]">
          <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-sm text-slate-500">Giá thuê mỗi tháng</p>
                <p className="text-3xl font-black text-slate-900">{Number(room.price || 0).toLocaleString("vi-VN")}đ</p>
              </div>
              <span className="flex items-center gap-1 rounded bg-green-500/10 px-2 py-1 text-sm font-bold text-green-600">
                <span className="material-symbols-outlined text-xs">bolt</span>
                Ưu tiên xem nhanh
              </span>
            </div>

            <div className="mb-8 space-y-4">
              <label className="flex flex-col gap-2">
                <span className="px-1 text-xs font-bold uppercase text-slate-500">Thời gian xem phòng</span>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">calendar_month</span>
                  <input
                    className="w-full rounded-lg border-none bg-slate-100 py-2 pl-10 pr-4 font-medium text-slate-700"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(event) => setScheduledAt(event.target.value)}
                  />
                </div>
              </label>
              <label className="flex flex-col gap-2">
                <span className="px-1 text-xs font-bold uppercase text-slate-500">Số điện thoại liên hệ</span>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">phone</span>
                  <input
                    className="w-full rounded-lg border-none bg-slate-100 py-2 pl-10 pr-4 font-medium text-slate-700 focus:outline-primary"
                    type="tel"
                    placeholder="Nhập số điện thoại liên hệ"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </div>
              </label>
              <label className="flex flex-col gap-2">
                <span className="px-1 text-xs font-bold uppercase text-slate-500">Thời hạn thuê</span>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">schedule</span>
                  <select
                    className="w-full appearance-none rounded-lg border-none bg-slate-100 py-2 pl-10 pr-4 font-medium text-slate-700"
                    value={leaseTerm}
                    onChange={(event) => setLeaseTerm(event.target.value)}
                  >
                    <option>12 tháng</option>
                    <option>6 tháng</option>
                    <option>Linh hoạt</option>
                  </select>
                </div>
              </label>
            </div>

            {user?.role === "customer" ? (
              <div className="flex flex-col gap-3">
                <button className="flex h-14 items-center justify-center gap-2 rounded-xl bg-primary text-lg font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90" type="button" onClick={bookVisit}>
                  <span className="material-symbols-outlined">event</span>
                  Đặt lịch xem
                </button>
                <button className="flex h-14 items-center justify-center gap-2 rounded-xl bg-primary/10 text-lg font-bold text-primary transition-all hover:bg-primary/20" type="button" onClick={openChatPopup}>
                  <span className="material-symbols-outlined">chat</span>
                  Chat với chủ trọ
                </button>
                <button className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition-all hover:bg-slate-50" type="button" onClick={addFavorite}>
                  <span className="material-symbols-outlined">favorite</span>
                  Thêm vào yêu thích
                </button>
              </div>
            ) : (
              <p className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600">Đăng nhập bằng tài khoản khách hàng để đặt lịch xem, nhắn chủ trọ và gửi đánh giá.</p>
            )}

            <div className="mt-8 flex items-center gap-4 rounded-lg bg-slate-50 p-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                {(room.landlord?.fullName || "C").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-900">{room.landlord?.fullName || "Chủ trọ"}</p>
                <p className="text-xs text-slate-500">{room.landlord?.phone || "Đã xác minh"}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {user?.role === "customer" ? (
        <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 md:bottom-6 md:right-6">
          {showChatComposer ? (
            <div className="pointer-events-auto flex h-[28rem] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/60">
              <div className="flex items-center justify-between bg-primary p-4 text-white">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-green-400"></div>
                  <div>
                    <p className="font-bold">Chat với chủ trọ</p>
                    <p className="text-xs text-white/80">{room.landlord?.fullName || "Chủ trọ"}</p>
                  </div>
                </div>
                <button className="rounded-lg p-1 transition-colors hover:bg-white/20" type="button" onClick={() => setShowChatComposer(false)}>
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
                <span className="truncate pr-3">{room.title}</span>
                <Link className="shrink-0 font-semibold text-primary hover:underline" to="/messages">
                  Mở trang nhắn tin
                </Link>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
                {chatLoading ? (
                  <p className="text-sm text-slate-500">Đang tải hội thoại...</p>
                ) : chatMessages.length === 0 ? (
                  <p className="text-sm text-slate-500">Chưa có tin nhắn nào trong phòng này.</p>
                ) : (
                  chatMessages.map((item, index) => {
                    const ownMessage = Number(item.senderId) === Number(user?.id);
                    return (
                      <div className={`flex max-w-[85%] flex-col gap-1 ${ownMessage ? "ml-auto items-end" : ""}`} key={item.id || `${item.senderId}-${index}`}>
                        <div
                          className={`rounded-2xl p-3 text-sm ${
                            ownMessage ? "rounded-br-none bg-primary text-white" : "rounded-tl-none bg-slate-200 text-slate-700"
                          }`}
                        >
                          {item.content}
                        </div>
                        <span className="text-[10px] text-slate-400">{formatMessageTime(item.createdAt)}</span>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef}></div>
              </div>

              <div className="border-t border-slate-200 bg-white p-3">
                <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 focus-within:ring-2 focus-within:ring-primary/20">
                  <textarea
                    className="max-h-28 flex-1 resize-none border-none bg-transparent px-1 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-0"
                    placeholder="Nhập tin nhắn cho chủ trọ..."
                    rows="1"
                    value={chatContent}
                    onChange={(event) => setChatContent(event.target.value)}
                    onKeyDown={handlePopupKeyDown}
                  />
                  <button className="flex size-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10" type="button" onClick={sendMessageToLandlord}>
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
                <p className="mt-2 text-center text-[10px] text-slate-400">Nhấn Enter để gửi, Shift + Enter để xuống dòng</p>
              </div>
            </div>
          ) : null}

          <button
            className="pointer-events-auto flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 transition-all hover:scale-110 active:scale-95"
            type="button"
            onClick={showChatComposer ? () => setShowChatComposer(false) : openChatPopup}
          >
            <span className="material-symbols-outlined text-3xl">forum</span>
          </button>
        </div>
      ) : null}

      <ReportRoomModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={submitRoomReport}
        isSubmitting={isReporting}
      />
    </div>
  );
};

export default RoomDetailPage;
