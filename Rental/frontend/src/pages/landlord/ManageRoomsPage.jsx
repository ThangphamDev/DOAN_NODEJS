import { useEffect, useMemo, useState } from "react";
import landlordService from "@/services/LandlordService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const initialForm = {
  title: "",
  price: "",
  area: "",
  address: "",
  description: "",
  images: [],
  status: "active",
};

const ManageRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const uploadBaseUrl = useMemo(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    return apiBaseUrl.replace(/\/api\/?$/, "");
  }, []);

  const loadRooms = async () => {
    try {
      const response = await landlordService.getMyRooms();
      setRooms(getApiData(response, []));
      setError("");
    } catch (err) {
      setError(getApiMessage(err, "Không tải được danh sách phòng"));
      setSuccessMessage("");
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

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
      const matchesTab = activeTab === "all" ? true : room.status === activeTab;
      const haystack = `${room.title || ""} ${room.address || ""} ${room.area || ""}`.toLowerCase();
      const matchesSearch = !normalized || haystack.includes(normalized);
      return matchesTab && matchesSearch;
    });
  }, [rooms, activeTab, searchQuery]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onImagesChange = (event) => {
    setForm((prev) => ({ ...prev, images: Array.from(event.target.files || []) }));
  };

  const resetEditor = () => {
    setForm(initialForm);
    setEditingRoomId(null);
    setShowEditor(false);
  };

  const startEdit = (room) => {
    setForm({
      title: room.title || "",
      price: room.price || "",
      area: room.area || "",
      address: room.address || "",
      description: room.description || "",
      images: [],
      status: room.status || "active",
    });
    setEditingRoomId(room.id);
    setShowEditor(true);
  };

  const submitForm = async (event) => {
    event.preventDefault();

    if (!form.title || !form.price || !form.area || !form.address) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc");
      setSuccessMessage("");
      return;
    }

    try {
      if (editingRoomId) {
        await landlordService.updateRoom(editingRoomId, {
          title: form.title,
          price: form.price,
          area: form.area,
          address: form.address,
          description: form.description,
          status: form.status,
        });
        setSuccessMessage("Đã cập nhật tin đăng.");
      } else {
        await landlordService.createRoom(form);
        setSuccessMessage("Đăng tin mới thành công.");
      }
      setError("");
      resetEditor();
      await loadRooms();
    } catch (err) {
      setError(getApiMessage(err, editingRoomId ? "Không thể cập nhật tin" : "Không thể đăng tin"));
      setSuccessMessage("");
    }
  };

  const toggleVisibility = async (room) => {
    const nextStatus = room.status === "hidden" ? "active" : "hidden";
    try {
      await landlordService.updateRoom(room.id, { status: nextStatus });
      setSuccessMessage(nextStatus === "hidden" ? "Đã ẩn tin đăng." : "Đã hiển thị lại tin đăng.");
      setError("");
      await loadRooms();
    } catch (err) {
      setError(getApiMessage(err, "Không thể cập nhật trạng thái hiển thị"));
      setSuccessMessage("");
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      await landlordService.deleteRoom(roomId);
      setSuccessMessage("Đã xóa tin đăng.");
      setError("");
      await loadRooms();
    } catch (err) {
      setError(getApiMessage(err, "Không thể xóa tin"));
      setSuccessMessage("");
    }
  };

  const resolveImageUrl = (room) => {
    const imageUrl = room.images?.[0]?.imageUrl || "";
    if (!imageUrl) return "";
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    return `${uploadBaseUrl}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
  };

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
      <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold">Quản lý tin đăng</h2>
          <p className="text-sm text-slate-500">Áp dụng trực tiếp cấu trúc của `postmanager.html`, giữ tạo/sửa/xóa bằng API hiện tại.</p>
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
            onClick={() => {
              if (showEditor && !editingRoomId) {
                resetEditor();
                return;
              }
              setEditingRoomId(null);
              setForm(initialForm);
              setShowEditor((prev) => !prev || Boolean(editingRoomId));
            }}
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            {showEditor && !editingRoomId ? "Đóng form" : "Thêm tin mới"}
          </button>
        </div>
      </div>

      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {successMessage && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p>}

      {showEditor && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">{editingRoomId ? "Cập nhật tin đăng" : "Tạo tin đăng mới"}</h3>
              <p className="text-sm text-slate-500">Dùng form thật của hệ thống, chỉ chuyển phần trình bày theo mẫu mới.</p>
            </div>
            <button className="text-sm font-semibold text-slate-500 hover:text-slate-700" onClick={resetEditor} type="button">Hủy</button>
          </div>
          <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={submitForm}>
            <input className="rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none" name="title" onChange={onChange} placeholder="Tiêu đề tin đăng" value={form.title} />
            <input className="rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none" name="price" onChange={onChange} placeholder="Giá thuê" value={form.price} />
            <input className="rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none" name="area" onChange={onChange} placeholder="Diện tích / khu vực" value={form.area} />
            <input className="rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none" name="address" onChange={onChange} placeholder="Địa chỉ" value={form.address} />
            <textarea className="min-h-32 rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none md:col-span-2" name="description" onChange={onChange} placeholder="Mô tả chi tiết" value={form.description}></textarea>
            {editingRoomId ? (
              <select className="rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none md:col-span-2" name="status" onChange={onChange} value={form.status}>
                <option value="active">Đang hiển thị</option>
                <option value="hidden">Đã ẩn</option>
                <option value="rented">Đã thuê</option>
              </select>
            ) : (
              <input accept="image/*" className="rounded-lg border border-slate-200 px-4 py-3 text-sm md:col-span-2" multiple onChange={onImagesChange} type="file" />
            )}
            <div className="md:col-span-2">
              <button className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90" type="submit">
                {editingRoomId ? "Lưu cập nhật" : "Đăng tin mới"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex border-b border-slate-200 gap-8 px-2">
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
            const imageUrl = resolveImageUrl(room);
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
                        <h3 className="text-lg font-bold transition-colors hover:text-primary">{room.title}</h3>
                        <span className="text-lg font-bold text-primary">{Number(room.price || 0).toLocaleString("vi-VN")}đ/tháng</span>
                      </div>
                      <div className="mb-4 flex flex-wrap gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">square_foot</span> {room.area || "Đang cập nhật"}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span> {room.address || "Chưa cập nhật"}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> {room.updatedAt ? `Cập nhật ${new Date(room.updatedAt).toLocaleDateString("vi-VN")}` : "Mới tạo"}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex gap-4 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">reviews</span> {room.reviews?.length || 0} đánh giá</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">sell</span> #{room.id}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-slate-200" onClick={() => startEdit(room)} type="button">
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
    </div>
  );
};

export default ManageRoomsPage;
