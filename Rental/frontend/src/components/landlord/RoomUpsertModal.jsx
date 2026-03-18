import { useMemo, useRef, useState } from "react";
import Modal from "@/components/common/Modal";
import { useNotify } from "@/context/NotifyContext.jsx";
import {
  ROOM_BADGE_TONES,
  ROOM_ICON_OPTIONS,
  createNewImageItems,
  hydrateRoomForm,
  normalizeRoomDetails,
} from "@/utils/roomDetails";

const FORM_TABS = [
  { id: "overview", label: "Cơ bản", icon: "edit_square" },
  { id: "images", label: "Hình ảnh", icon: "photo_library" },
  { id: "details", label: "Chi tiết", icon: "fact_check" },
  { id: "booking", label: "Hiển thị", icon: "dashboard_customize" },
];

const createBadge = () => ({ label: "", tone: "primary" });
const createQuickFact = () => ({ icon: "info", label: "", value: "" });
const createAmenity = () => ({ icon: "check_circle", label: "" });

const SectionHeading = ({ title, description }) => (
  <div className="mb-4">
    <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900">{title}</h4>
    {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
  </div>
);

const ImageThumb = ({ item, index, total, isActive, onSelect, onMove, onRemove }) => (
  <div className={`overflow-hidden rounded-2xl border ${isActive ? "border-primary shadow-lg shadow-primary/10" : "border-slate-200"} bg-white`}>
    <button className="block w-full text-left" type="button" onClick={onSelect}>
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {item.previewUrl ? <img alt={item.name} className="h-full w-full object-cover" src={item.previewUrl} /> : null}
        <div className="absolute left-3 top-3 rounded-full bg-slate-950/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          {item.type === "existing" ? "Ảnh hiện có" : "Ảnh mới"}
        </div>
      </div>
    </button>
    <div className="space-y-3 p-3">
      <div>
        <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
        <p className="text-xs text-slate-500">Vị trí #{index + 1}</p>
      </div>
      <div className="flex gap-2">
        <button
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={() => onMove(index, index - 1)}
          disabled={index === 0}
        >
          Lên
        </button>
        <button
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={() => onMove(index, index + 1)}
          disabled={index === total - 1}
        >
          Xuống
        </button>
        <button
          className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
          type="button"
          onClick={() => onRemove(index)}
        >
          Xóa
        </button>
      </div>
    </div>
  </div>
);

const RoomUpsertModal = ({
  open,
  room,
  onClose,
  onSubmit,
  isSubmitting = false,
  uploadBaseUrl,
}) => {
  const [form, setForm] = useState(() => hydrateRoomForm(room, uploadBaseUrl));
  const [activeTab, setActiveTab] = useState("overview");
  const [activeImageId, setActiveImageId] = useState(null);
  const fileMapRef = useRef(new Map());
  const notify = useNotify();

  const activeImage = useMemo(
    () => form.imageItems.find((item) => item.clientId === activeImageId) || form.imageItems[0] || null,
    [activeImageId, form.imageItems]
  );

  const updateRootField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateDetailValue = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [section]: {
          ...prev.details[section],
          [key]: value,
        },
      },
    }));
  };

  const updateArrayItem = (field, index, key, value) => {
    setForm((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [field]: prev.details[field].map((item, itemIndex) =>
          itemIndex === index ? { ...item, [key]: value } : item
        ),
      },
    }));
  };

  const addArrayItem = (field, factory) => {
    setForm((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [field]: [...prev.details[field], factory()],
      },
    }));
  };

  const removeArrayItem = (field, index) => {
    setForm((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [field]: prev.details[field].filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  };

  const handleLeaseTermsChange = (value) => {
    const leaseTerms = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    setForm((prev) => {
      const nextLeaseTerms = leaseTerms.length ? leaseTerms : [];
      const defaultLeaseTerm = nextLeaseTerms.includes(prev.details.booking.defaultLeaseTerm)
        ? prev.details.booking.defaultLeaseTerm
        : nextLeaseTerms[0] || "";

      return {
        ...prev,
        details: {
          ...prev.details,
          booking: {
            ...prev.details.booking,
            leaseTerms: nextLeaseTerms,
            defaultLeaseTerm,
          },
        },
      };
    });
  };

  const handleImagesChange = (event) => {
    const nextItems = createNewImageItems(Array.from(event.target.files || []));
    if (!nextItems.length) return;

    nextItems.forEach((item) => {
      if (item.file) {
        fileMapRef.current.set(item.clientId, item.file);
      }
    });

    setForm((prev) => ({
      ...prev,
      imageItems: [...prev.imageItems, ...nextItems],
    }));
    setActiveImageId(nextItems[0].clientId);
    event.target.value = "";
  };

  const moveImageItem = (fromIndex, toIndex) => {
    setForm((prev) => {
      if (toIndex < 0 || toIndex >= prev.imageItems.length) {
        return prev;
      }

      const nextItems = [...prev.imageItems];
      const [movedItem] = nextItems.splice(fromIndex, 1);
      nextItems.splice(toIndex, 0, movedItem);

      return {
        ...prev,
        imageItems: nextItems,
      };
    });
  };

  const removeImageItem = (index) => {
    setForm((prev) => {
      const removedItem = prev.imageItems[index];
      if (removedItem?.type === "new" && removedItem.previewUrl) {
        URL.revokeObjectURL(removedItem.previewUrl);
        fileMapRef.current.delete(removedItem.clientId);
      }

      return {
        ...prev,
        imageItems: prev.imageItems.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedImageItems = form.imageItems.map((item) =>
      item.type === "new"
        ? {
            ...item,
            file: fileMapRef.current.get(item.clientId) || item.file || null,
          }
        : item
    );

    const missingNewFiles = normalizedImageItems.filter((item) => item.type === "new" && !item.file);
    if (missingNewFiles.length) {
      notify.error("Một hoặc nhiều ảnh mới không còn file gốc để upload. Hãy chọn lại các ảnh mới trước khi lưu.");
      return;
    }

    onSubmit({
      ...form,
      imageItems: normalizedImageItems,
      details: normalizeRoomDetails(form.details, form),
    });
  };

  const isEditing = Boolean(room?.id);

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      title={isEditing ? "Cập nhật tin đăng" : "Tạo tin đăng mới"}
      description="Chia dữ liệu theo từng tab để chủ trọ dễ nhập, kiểm tra và sắp xếp nội dung."
      maxWidthClass="max-w-6xl"
    >
      <datalist id="room-icon-options">
        {ROOM_ICON_OPTIONS.map((icon) => (
          <option key={icon} value={icon} />
        ))}
      </datalist>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {FORM_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {activeTab === "overview" ? (
          <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
            <SectionHeading title="Thông tin cơ bản" description="Các trường cốt lõi để lọc, tìm kiếm và hiển thị danh sách." />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Tiêu đề</span>
                <input className="rounded-xl border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none" value={form.title} onChange={(event) => updateRootField("title", event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Giá thuê</span>
                <input className="rounded-xl border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none" inputMode="numeric" value={form.price} onChange={(event) => updateRootField("price", event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Khu vực dùng để lọc</span>
                <input className="rounded-xl border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none" value={form.area} onChange={(event) => updateRootField("area", event.target.value)} placeholder="Ví dụ: Quận 7" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Địa chỉ hiển thị</span>
                <input className="rounded-xl border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none" value={form.address} onChange={(event) => updateRootField("address", event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
                <span>Mô tả</span>
                <textarea className="min-h-40 rounded-xl border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none" value={form.description} onChange={(event) => updateRootField("description", event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700 md:max-w-xs">
                <span>Trạng thái</span>
                <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 focus:border-primary focus:outline-none" value={form.status} onChange={(event) => updateRootField("status", event.target.value)}>
                  <option value="active">Đang hiển thị</option>
                  <option value="hidden">Đã ẩn</option>
                  <option value="rented">Đã thuê</option>
                </select>
              </label>
            </div>
          </section>
        ) : null}

        {activeTab === "images" ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <SectionHeading title="Bộ ảnh tin đăng" description="Xem preview lớn, thêm ảnh mới, đổi thứ tự hiển thị và xóa ảnh ngay trong modal." />
            <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100">
                  <div className="relative aspect-[16/10]">
                    {activeImage?.previewUrl ? (
                      <img alt={activeImage.name} className="h-full w-full object-cover" src={activeImage.previewUrl} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-6xl">imagesmode</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent p-5 text-white">
                      <p className="text-xs font-bold uppercase tracking-[0.3em]">{activeImage?.type === "existing" ? "Ảnh hiện có" : "Ảnh mới"}</p>
                      <p className="mt-2 text-lg font-semibold">{activeImage?.name || "Chưa có ảnh nào"}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <input accept="image/*" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm" multiple onChange={handleImagesChange} type="file" />
                  <p className="mt-3 text-sm text-slate-500">
                    Ảnh mới sẽ được thêm vào cuối danh sách. Bạn có thể bấm Lên/Xuống để sắp xếp lại ngay sau khi chọn.
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-400">
                    Đang giữ file mới: {form.imageItems.filter((item) => item.type === "new").length} ảnh
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900">Danh sách ảnh</h5>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{form.imageItems.length} ảnh</span>
                </div>
                {form.imageItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">Tin đăng chưa có ảnh. Hãy tải ít nhất một ảnh để phần preview hiển thị tốt hơn.</div>
                ) : (
                  <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
                    {form.imageItems.map((item, index) => (
                      <ImageThumb
                        key={item.clientId}
                        item={item}
                        index={index}
                        total={form.imageItems.length}
                        isActive={item.clientId === activeImage?.clientId}
                        onSelect={() => setActiveImageId(item.clientId)}
                        onMove={moveImageItem}
                        onRemove={removeImageItem}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "details" ? (
          <>
            <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
              <SectionHeading title="Nhãn nổi bật" description="Các badge hiển thị ở đầu trang chi tiết." />
              <div className="space-y-3">
                {form.details.badges.map((badge, index) => (
                  <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr,180px,auto]" key={`${badge.label}-${index}`}>
                    <input className="rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none" placeholder="Ví dụ: Full nội thất" value={badge.label} onChange={(event) => updateArrayItem("badges", index, "label", event.target.value)} />
                    <select className="rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none" value={badge.tone} onChange={(event) => updateArrayItem("badges", index, "tone", event.target.value)}>
                      {ROOM_BADGE_TONES.map((tone) => (
                        <option key={tone.value} value={tone.value}>{tone.label}</option>
                      ))}
                    </select>
                    <button className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50" type="button" onClick={() => removeArrayItem("badges", index)}>Xóa</button>
                  </div>
                ))}
                <button className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90" type="button" onClick={() => addArrayItem("badges", createBadge)}>Thêm badge</button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <SectionHeading title="Thông tin nhanh" description="Các ô thống kê dưới tiêu đề trang chi tiết." />
              <div className="space-y-3">
                {form.details.quickFacts.map((item, index) => (
                  <div className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[180px,1fr,1fr,auto]" key={`${item.label}-${index}`}>
                    <input className="rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none" list="room-icon-options" placeholder="material icon" value={item.icon} onChange={(event) => updateArrayItem("quickFacts", index, "icon", event.target.value)} />
                    <input className="rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none" placeholder="Nhãn" value={item.label} onChange={(event) => updateArrayItem("quickFacts", index, "label", event.target.value)} />
                    <input className="rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none" placeholder="Giá trị" value={item.value} onChange={(event) => updateArrayItem("quickFacts", index, "value", event.target.value)} />
                    <button className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50" type="button" onClick={() => removeArrayItem("quickFacts", index)}>Xóa</button>
                  </div>
                ))}
                <button className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90" type="button" onClick={() => addArrayItem("quickFacts", createQuickFact)}>Thêm thông tin nhanh</button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
              <SectionHeading title="Tiện ích" description="Danh sách hiển thị trong phần tiện ích của phòng." />
              <div className="space-y-3">
                {form.details.amenities.map((item, index) => (
                  <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[180px,1fr,auto]" key={`${item.label}-${index}`}>
                    <input className="rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none" list="room-icon-options" placeholder="material icon" value={item.icon} onChange={(event) => updateArrayItem("amenities", index, "icon", event.target.value)} />
                    <input className="rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none" placeholder="Ví dụ: Máy lạnh" value={item.label} onChange={(event) => updateArrayItem("amenities", index, "label", event.target.value)} />
                    <button className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50" type="button" onClick={() => removeArrayItem("amenities", index)}>Xóa</button>
                  </div>
                ))}
                <button className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90" type="button" onClick={() => addArrayItem("amenities", createAmenity)}>Thêm tiện ích</button>
              </div>
            </section>
          </>
        ) : null}

        {activeTab === "booking" ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <SectionHeading title="Nội dung hiển thị cột phải" description="Text động cho khối giá thuê, bản đồ và thông tin chủ trọ." />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Nhãn giá thuê</span>
                <input className="rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none" value={form.details.pricing.label} onChange={(event) => updateDetailValue("pricing", "label", event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Badge bên cạnh giá</span>
                <input className="rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none" value={form.details.pricing.badgeText} onChange={(event) => updateDetailValue("pricing", "badgeText", event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Nhãn vị trí trong bản đồ</span>
                <input className="rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none" value={form.details.location.label} onChange={(event) => updateDetailValue("location", "label", event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Phụ đề chủ trọ</span>
                <input className="rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none" value={form.details.owner.subtitle} onChange={(event) => updateDetailValue("owner", "subtitle", event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
                <span>Danh sách thời hạn thuê, mỗi dòng một lựa chọn</span>
                <textarea className="min-h-28 rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none" value={form.details.booking.leaseTerms.join("\n")} onChange={(event) => handleLeaseTermsChange(event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700 md:max-w-xs">
                <span>Mặc định chọn</span>
                <select className="rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none" value={form.details.booking.defaultLeaseTerm} onChange={(event) => updateDetailValue("booking", "defaultLeaseTerm", event.target.value)}>
                  {form.details.booking.leaseTerms.map((term) => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <button className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50" type="button" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </button>
          <button className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : isEditing ? "Lưu cập nhật" : "Đăng tin ngay"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RoomUpsertModal;
