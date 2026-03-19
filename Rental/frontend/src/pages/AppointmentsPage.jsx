import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LoadingState from "@/components/common/LoadingState";
import roomService from "@/services/RoomService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const statusMap = {
  pending: {
    label: "Chờ duyệt",
    className: "bg-amber-100 text-amber-700",
  },
  approved: {
    label: "Đã duyệt",
    className: "bg-green-100 text-green-700",
  },
  rejected: {
    label: "Từ chối",
    className: "bg-rose-100 text-rose-700",
  },
};

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadAppointments = async () => {
      try {
        const response = await roomService.getMyAppointments();
        if (!isMounted) return;
        setAppointments(getApiData(response, []));
      } catch (err) {
        if (!isMounted) return;
        setError(getApiMessage(err, "Không tải được lịch hẹn của bạn"));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadAppointments();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedAppointments = useMemo(
    () => [...appointments].sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0)),
    [appointments]
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <section className="page-section">
      <div className="mb-6">
        <h1>Lịch hẹn của tôi</h1>
        <p className="text-sm text-slate-500">Theo dõi toàn bộ lịch xem phòng bạn đã gửi cho chủ trọ.</p>
      </div>

      {error ? <div className="card text-sm text-rose-600">{error}</div> : null}

      <div className="card-list">
        {sortedAppointments.length === 0 ? (
          <div className="card">
            <p className="text-sm text-slate-500">Bạn chưa có lịch hẹn nào.</p>
          </div>
        ) : (
          sortedAppointments.map((item) => {
            const status = statusMap[item.status] || statusMap.pending;
            return (
              <article className="card" key={item.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="mb-2 text-lg font-bold text-slate-900">{item.room?.title || "Phòng đang quan tâm"}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span>{item.room?.address || "Chưa có địa chỉ"}</span>
                      <span>{item.scheduledAt ? new Date(item.scheduledAt).toLocaleString("vi-VN") : "Chưa rõ thời gian"}</span>
                      <span>{item.phone || "Chưa có số điện thoại"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                    {item.room?.id ? (
                      <Link className="btn-ghost" to={`/rooms/${item.room.id}`}>
                        Xem phòng
                      </Link>
                    ) : null}
                  </div>
                </div>

                {item.note ? <p className="mt-4 text-sm text-slate-600">Ghi chú: {item.note}</p> : null}
                {item.rejectReason ? <p className="mt-2 text-sm text-rose-600">Lý do từ chối: {item.rejectReason}</p> : null}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};

export default AppointmentsPage;
