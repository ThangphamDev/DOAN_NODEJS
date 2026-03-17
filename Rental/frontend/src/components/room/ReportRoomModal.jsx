import { useEffect, useState } from "react";
import Modal from "@/components/common/Modal";

const defaultForm = {
  reason: "Thông tin sai sự thật",
  details: "",
};

const reasonOptions = [
  "Thông tin sai sự thật",
  "Giá không đúng thực tế",
  "Hình ảnh gây hiểu nhầm",
  "Nội dung không phù hợp",
  "Nghi ngờ lừa đảo",
  "Lý do khác",
];

const ReportRoomModal = ({ open, onClose, onSubmit, isSubmitting = false }) => {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (!open) {
      setForm(defaultForm);
    }
  }, [open]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit?.(form);
  };

  return (
    <Modal
      open={open}
      title="Báo cáo bài đăng"
      description="Gửi báo cáo nếu bạn thấy tin đăng có dấu hiệu sai lệch, gây hiểu nhầm hoặc không an toàn."
      onClose={onClose}
      maxWidthClass="max-w-lg"
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          <span>Lý do báo cáo</span>
          <select
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-primary focus:outline-none"
            value={form.reason}
            onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
          >
            {reasonOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          <span>Mô tả chi tiết</span>
          <textarea
            className="min-h-32 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-primary focus:outline-none"
            placeholder="Mô tả ngắn gọn vấn đề bạn gặp phải để admin dễ xử lý hơn"
            value={form.details}
            onChange={(event) => setForm((prev) => ({ ...prev, details: event.target.value }))}
          />
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportRoomModal;
