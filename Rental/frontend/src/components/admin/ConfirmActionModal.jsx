import Modal from "@/components/common/Modal";

const ConfirmActionModal = ({
  open,
  title,
  description,
  confirmLabel,
  confirmClassName,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  return (
    <Modal
      description={description}
      maxWidthClass="max-w-lg"
      onClose={onClose}
      open={open}
      title={title}
    >
      <div className="flex justify-end gap-3">
        <button
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          onClick={onClose}
          type="button"
        >
          Hủy
        </button>
        <button
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmClassName}`}
          disabled={isSubmitting}
          onClick={onConfirm}
          type="button"
        >
          {isSubmitting ? "Đang xử lý..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmActionModal;
