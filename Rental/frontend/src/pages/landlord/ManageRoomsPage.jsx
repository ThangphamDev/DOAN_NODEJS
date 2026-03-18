import { useCallback, useEffect, useMemo, useState } from "react";
import RoomUpsertModal from "@/components/landlord/RoomUpsertModal";
import { useNotify } from "@/context/NotifyContext.jsx";
import landlordService from "@/services/LandlordService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";
import { createExistingImageItems, resolveRoomImageUrl } from "@/utils/roomDetails";

const ManageRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorVersion, setEditorVersion] = useState(0);
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notify = useNotify();

  const uploadBaseUrl = useMemo(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    return apiBaseUrl.replace(/\/api\/?$/, "");
  }, []);

  const loadRooms = useCallback(async () => {
    try {
      const response = await landlordService.getMyRooms();
      setRooms(getApiData(response, []));
    } catch (err) {
      notify.error(getApiMessage(err, "Không tải được danh sách phòng"));
    }
  }, [notify]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const roomCounts = useMemo(
    () => ({
      active: rooms.filter((room) => room.status === "active").length,
      hidden: rooms.filter((room) => room.status === "hidden").length,
      rented: rooms.filter((room) => room.status === "rented").length,
    }),
    [rooms]
  );

  const filteredRooms = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchesTab = room.status === activeTab;
      const detailText = [
        room.title,
        room.address,
        room.area,
        ...(room.details?.badges || []).map((item) => item.label),
        ...(room.details?.quickFacts || []).flatMap((item) => [item.label, item.value]),
      ]
        .join(" ")
        .toLowerCase();

      return matchesTab && (!normalized || detailText.includes(normalized));
    });
  }, [rooms, activeTab, searchQuery]);

  const openCreateModal = () => {
    setEditingRoom(null);
    setEditorVersion((prev) => prev + 1);
    setShowEditor(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setEditorVersion((prev) => prev + 1);
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingRoom(null);
  };

  const submitRoom = async (payload) => {
    if (!payload.title || !payload.price || !payload.area || !payload.address) {
      notify.warning("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingRoom?.id) {
        await landlordService.updateRoom(editingRoom.id, payload);
        notify.success("Đã cập nhật tin đăng.");
      } else {
        await landlordService.createRoom(payload);
        notify.success("Đăng tin mới thành công.");
      }

      closeEditor();
      await loadRooms();
    } catch (err) {
      notify.error(getApiMessage(err, editingRoom?.id ? "Không thể cập nhật tin" : "Không thể đăng tin"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleVisibility = async (room) => {
    const nextStatus = room.status === "hidden" ? "active" : "hidden";

    try {
      await landlordService.updateRoom(room.id, {
        ...room,
        imageItems: createExistingImageItems(room.images || [], uploadBaseUrl),
        status: nextStatus,
      });
      notify.success(nextStatus === "hidden" ? "Đã ẩn tin đăng." : "Đã hiển thị lại tin đăng.");
      await loadRooms();
    } catch (err) {
      notify.error(getApiMessage(err, "Không thể cập nhật trạng thái hiển thị"));
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      await landlordService.deleteRoom(roomId);
      notify.success("Đã xóa tin đăng.");
      await loadRooms();
    } catch (err) {
      notify.error(getApiMessage(err, "Không thể xóa tin"));
    }
  };

  const resolveCoverImage = (room) => resolveRoomImageUrl(room.images?.[0]?.imageUrl || "", uploadBaseUrl);

  const getStatusBadge = (status) => {
    if (status === "hidden") return "bg-slate-900 text-white";
    if (status === "rented") return "bg-amber-500 text-white";
    return "bg-green-500 text-white";
  };

  const getStatusLabel = (status) => {
    if (status === "hidden") return "Đã ẩn";
    if (status === "rented") return "Đã thuê";
    return "Đang hiển thị";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-extrabold tracking-tight">Quản lý tin đăng</h2>
          <p className="text-slate-500">Modal mới hỗ trợ nhập liệu theo tab, preview ảnh lớn và sắp xếp lại thứ tự hiển thị.</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
              placeholder="Tìm kiếm tin đăng..."
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>
          <button
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary/90"
            type="button"
            onClick={openCreateModal}
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Thêm tin mới
          </button>
        </div>
      </div>

      <div className="flex gap-8 border-b border-slate-200 px-2">
        <button className={`pb-4 text-sm ${activeTab === "active" ? "border-b-2 border-primary font-bold text-primary" : "border-b-2 border-transparent font-medium text-slate-500 hover:text-slate-700"}`} type="button" onClick={() => setActiveTab("active")}>Đang hiển thị ({roomCounts.active})</button>
        <button className={`pb-4 text-sm ${activeTab === "hidden" ? "border-b-2 border-primary font-bold text-primary" : "border-b-2 border-transparent font-medium text-slate-500 hover:text-slate-700"}`} type="button" onClick={() => setActiveTab("hidden")}>Đã ẩn ({roomCounts.hidden})</button>
        <button className={`pb-4 text-sm ${activeTab === "rented" ? "border-b-2 border-primary font-bold text-primary" : "border-b-2 border-transparent font-medium text-slate-500 hover:text-slate-700"}`} type="button" onClick={() => setActiveTab("rented")}>Đã thuê ({roomCounts.rented})</button>
      </div>

      <div className="space-y-4">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
            <span className="material-symbols-outlined mb-4 text-6xl">post_add</span>
            <p className="text-lg font-medium">Không có tin đăng nào ở trạng thái hiện tại.</p>
          </div>
        ) : (
          filteredRooms.map((room) => {
            const imageUrl = resolveCoverImage(room);
            const mainFacts = (room.details?.quickFacts || []).slice(0, 2);

            return (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md" key={room.id}>
                <div className="flex flex-col md:flex-row">
                  <div className="relative h-48 w-full bg-slate-200 md:h-auto md:w-64">
                    {imageUrl ? (
                      <img className="h-full w-full object-cover" src={imageUrl} alt={room.title} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                        <span className="material-symbols-outlined text-5xl">home_work</span>
                      </div>
                    )}
                    <div className={`absolute left-2 top-2 rounded px-2 py-1 text-[10px] font-bold uppercase ${getStatusBadge(room.status)}`}>
                      {getStatusLabel(room.status)}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold transition-colors hover:text-primary">{room.title}</h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(room.details?.badges || []).slice(0, 3).map((badge) => (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600" key={`${room.id}-${badge.label}`}>
                                {badge.label}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-lg font-bold text-primary">{Number(room.price || 0).toLocaleString("vi-VN")}đ/tháng</span>
                      </div>

                      <div className="mb-4 flex flex-wrap gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span> {room.address || "Chưa cập nhật"}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">pin_drop</span> {room.area || "Chưa cập nhật khu vực"}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> {room.updatedAt ? `Cập nhật ${new Date(room.updatedAt).toLocaleDateString("vi-VN")}` : "Mới tạo"}</span>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                        {mainFacts.map((fact) => (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1" key={`${room.id}-${fact.label}`}>
                            <span className="material-symbols-outlined text-base text-primary">{fact.icon}</span>
                            <span>{fact.value}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex gap-4 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">reviews</span> {room.reviews?.length || 0} đánh giá</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">sell</span> #{room.id}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-slate-200" onClick={() => openEditModal(room)} type="button">
                          <span className="material-symbols-outlined text-lg">edit</span>
                          Sửa
                        </button>
                        <button className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-slate-200" onClick={() => toggleVisibility(room)} type="button">
                          <span className="material-symbols-outlined text-lg">visibility_off</span>
                          {room.status === "hidden" ? "Hiện tin" : "Ẩn tin"}
                        </button>
                        <button className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100" onClick={() => deleteRoom(room.id)} type="button">
                          <span className="material-symbols-outlined text-lg">delete</span>
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showEditor ? (
        <RoomUpsertModal
          key={editingRoom?.id ? `room-${editingRoom.id}-${editorVersion}` : `new-${editorVersion}`}
          open={showEditor}
          room={editingRoom}
          onClose={closeEditor}
          onSubmit={submitRoom}
          isSubmitting={isSubmitting}
          uploadBaseUrl={uploadBaseUrl}
        />
      ) : null}
    </div>
  );
};

export default ManageRoomsPage;
