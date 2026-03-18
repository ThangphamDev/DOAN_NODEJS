import Modal from "@/components/common/Modal";

const AppointmentDetailModal = ({ open, item, onClose }) => {
  if (!item) return null;

  return (
    <Modal
      description="Chi tiết thông tin khách hàng và lịch trực tiếp."
      maxWidthClass="max-w-2xl"
      onClose={onClose}
      open={open}
      title="Chi tiết lịch hẹn"
    >
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-inner">
        <h4 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
           <span className="material-symbols-outlined text-primary">person</span>
           Thông tin khách hàng
        </h4>
        <div className="grid gap-3 text-sm">
          <div className="grid grid-cols-[140px_1fr] gap-2 items-center">
            <span className="text-slate-500">Khách hàng:</span>
            <span className="font-semibold text-slate-900 text-base">{item.customer?.fullName}</span>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-2 items-center">
            <span className="text-slate-500">Số điện thoại:</span>
            <span className="font-medium text-slate-800">{item.phone || item.customer?.phone || "Chưa cung cấp"}</span>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-2 items-center">
            <span className="text-slate-500">Email LH:</span>
            <span className="text-slate-800">{item.customer?.email || "Chưa cung cấp"}</span>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-2 items-start mt-2 border-t border-slate-200 pt-3">
            <span className="text-slate-500">Phòng quan tâm:</span>
            <a href={`/rooms/${item.room?.id}`} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline cursor-pointer">{item.room?.title}</a>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-2 items-center">
            <span className="text-slate-500">Giá phòng:</span>
            <span className="font-bold text-green-600">{Number(item.room?.price || 0).toLocaleString("vi-VN")} đ/tháng</span>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-2 items-center">
            <span className="text-slate-500">Địa chỉ phòng:</span>
            <span className="text-slate-800">{item.room?.address || "Đang cập nhật"}</span>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-2 items-center mt-2 border-t border-slate-200 pt-3">
            <span className="text-slate-500">Thời gian xem yêu cầu:</span>
            <span className="text-slate-800 font-medium">
               {item.scheduledAt ? new Date(item.scheduledAt).toLocaleString("vi-VN") : "Chưa rõ"}
            </span>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-2 items-center">
            <span className="text-slate-500">Ngày đặt lịch:</span>
            <span className="text-slate-600 font-medium">{item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : ""}</span>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-200 pt-4">
          <span className="mb-2 block text-sm font-bold text-slate-700">Lời nhắn khách gửi:</span>
          <div className="rounded-lg bg-white p-3 text-sm border border-slate-200 shadow-sm min-h-[60px] text-slate-700">
             <span className={item.note ? "" : "italic text-slate-500"}>{item.note || "Khách không để lại lời nhắn kèm theo."}</span>
          </div>
        </div>

        {item.status === "rejected" && (
          <div className="mt-4 border-t border-slate-200 pt-4">
            <span className="mb-2 block text-sm font-bold text-rose-600">Lý do từ chối:</span>
            <div className="rounded-lg bg-rose-50 p-3 text-sm border border-rose-100 text-rose-700 font-medium leading-relaxed">
               {item.rejectReason || "Không có lý do từ chối."}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex justify-end">
         <button onClick={onClose} className="rounded-xl border border-slate-200 px-6 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Đóng lại</button>
      </div>
    </Modal>
  );
};

export default AppointmentDetailModal;
