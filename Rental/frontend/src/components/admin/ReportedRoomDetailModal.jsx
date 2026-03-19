import Modal from "@/components/common/Modal";

const formatDateTime = (value) => {
  if (!value) {
    return "Chưa cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

const getReportMeta = (count) => {
  if (count >= 3) {
    return {
      label: "Vi phạm nặng",
      className: "bg-red-100 text-red-700",
    };
  }

  if (count === 2) {
    return {
      label: "Cần xử lý gấp",
      className: "bg-amber-100 text-amber-700",
    };
  }

  return {
    label: "Mới phát sinh",
    className: "bg-primary/10 text-primary",
  };
};

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const ReportedRoomDetailModal = ({
  open,
  room,
  error,
  isLoading,
  onClose,
  actionSlot = null,
}) => {
  return (
    <Modal
      description="Xem lý do báo cáo, người báo cáo và mở nhanh đến tin đăng."
      maxWidthClass="max-w-6xl"
      onClose={onClose}
      open={open}
      title="Chi tiết báo cáo"
    >
      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
          Đang tải chi tiết báo cáo...
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      {!isLoading && !error && !room ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
          Không có dữ liệu báo cáo để hiển thị.
        </div>
      ) : null}

      {!isLoading && !error && room ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{room.title}</h4>
                  <p className="mt-1 text-sm text-slate-500">{room.address || "Chưa cập nhật địa chỉ"}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getReportMeta(Number(room.reportedCount || 0)).className}`}>
                  {room.reportedCount || 0} lượt báo cáo
                </span>
              </div>

              <dl className="mt-5 grid grid-cols-1 gap-4 text-sm text-slate-600 md:grid-cols-2">
                <div>
                  <dt className="font-semibold text-slate-900">Chủ trọ</dt>
                  <dd>{room.landlord?.fullName || "Chưa xác định"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">Liên hệ</dt>
                  <dd>{room.landlord?.email || room.landlord?.phone || "Không có"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">Giá</dt>
                  <dd>{room.price ? `${Number(room.price).toLocaleString("vi-VN")} VND` : "Chưa cập nhật"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">Lần cuối cập nhật</dt>
                  <dd>{formatDateTime(room.updatedAt)}</dd>
                </div>
              </dl>

              <div className="mt-5 rounded-lg bg-slate-50 p-4">
                <p className="mb-2 text-sm font-semibold text-slate-900">Mô tả tin đăng</p>
                <p className="text-sm leading-6 text-slate-600">{room.description || "Tin đăng không có mô tả."}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h4 className="text-lg font-bold text-slate-900">Danh sách báo cáo</h4>
                <span className="text-sm text-slate-500">{room.reports?.length || 0} báo cáo</span>
              </div>

              <div className="space-y-3">
                {(room.reports || []).length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                    Chưa có nội dung báo cáo chi tiết cho tin này.
                  </div>
                ) : (
                  room.reports.map((report) => (
                    <article className="rounded-xl border border-slate-200 p-4" key={report.id}>
                      <div>
                        <h5 className="font-semibold text-slate-900">{report.reason || "Báo cáo vi phạm"}</h5>
                        <p className="mt-1 text-xs text-slate-500">
                          {report.reporter?.fullName || report.reporter?.email || "Người dùng"} - {formatDateTime(report.createdAt)}
                        </p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {report.details || "Người dùng không để lại mô tả bổ sung."}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 p-5">
              <h4 className="text-lg font-bold text-slate-900">Hành động nhanh</h4>
              <div className="mt-4 space-y-3">
                <a
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/5"
                  href={room.roomLink}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span className="material-symbols-outlined text-lg">travel_explore</span>
                  Mở tin đăng công khai
                </a>
                {actionSlot}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-5">
              <h4 className="text-lg font-bold text-slate-900">Ảnh đại diện</h4>
              {(room.images || []).length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">Tin đăng này chưa có ảnh.</p>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {room.images.slice(0, 4).map((image) => (
                    <img
                      alt={room.title}
                      className="h-28 w-full rounded-lg object-cover"
                      key={image.id}
                      src={`${apiBaseUrl}${image.imageUrl}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default ReportedRoomDetailModal;
