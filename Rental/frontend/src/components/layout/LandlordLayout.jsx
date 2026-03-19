import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LandlordMetricsProvider, useLandlordMetrics } from "@/context/LandlordMetricsContext.jsx";
import useAuth from "@/hooks/useAuth";

const LANDLORD_PAGE_META = {
  "/landlord": {
    title: "Bảng điều khiển chủ trọ",
    description: "Tổng quan hoạt động cho thuê và theo dõi các đầu việc cần xử lý nhanh.",
  },
  "/landlord/rooms": {
    title: "Quản lý tin đăng",
    description: "Theo dõi trạng thái hiển thị, cập nhật nội dung và tối ưu bộ ảnh tin đăng.",
  },
  "/landlord/appointments": {
    title: "Quản lý lịch hẹn",
    description: "Xem nhanh lịch xem phòng, duyệt yêu cầu và theo dõi các ca sắp tới.",
  },
  "/landlord/messages": {
    title: "Tin nhắn khách thuê",
    description: "Trao đổi theo từng tin đăng và xử lý phản hồi mới trong một nơi tập trung.",
  },
  "/landlord/reviews": {
    title: "Quản lý đánh giá",
    description: "Theo dõi phản hồi của khách thuê và trả lời ngay từ một nơi tập trung.",
  },
};

const renderCountBadge = (value, tone = "slate") => {
  if (!value) return null;

  const toneClassMap = {
    red: "bg-red-500 text-white",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold ${toneClassMap[tone] || toneClassMap.slate}`}>
      {value > 99 ? "99+" : value}
    </span>
  );
};

const LandlordLayoutContent = () => {
  const { user, logout } = useAuth();
  const { metrics } = useLandlordMetrics();
  const navigate = useNavigate();
  const location = useLocation();

  const pageMeta = LANDLORD_PAGE_META[location.pathname] || LANDLORD_PAGE_META["/landlord"];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getInitials = (value) =>
    (value || "CT")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  const navClassName = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
      isActive ? "bg-primary/10 font-medium text-primary" : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <div className="flex min-h-screen bg-background-light font-display text-slate-900">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex items-center gap-3 border-b border-slate-200 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
            <span className="material-symbols-outlined">apartment</span>
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">Landlord Pro</h1>
            <p className="text-xs text-slate-500">Khu vực chủ trọ</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-2 p-4">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Main Menu</div>

          <NavLink className={navClassName} end to="/landlord">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Tổng quan</span>
          </NavLink>

          <NavLink className={navClassName} to="/landlord/rooms">
            <span className="material-symbols-outlined">home_work</span>
            <span>Đăng tin bài</span>
            {renderCountBadge(metrics.roomsCount)}
          </NavLink>

          <NavLink className={navClassName} to="/landlord/appointments">
            <span className="material-symbols-outlined">event_note</span>
            <span>Quản lý lịch hẹn</span>
            {renderCountBadge(metrics.pendingAppointmentsCount, "amber")}
          </NavLink>

          <NavLink className={navClassName} to="/landlord/messages">
            <span className="material-symbols-outlined">forum</span>
            <span>Tin nhắn</span>
            {renderCountBadge(metrics.unreadMessagesCount, "red")}
          </NavLink>

          <NavLink className={navClassName} to="/landlord/reviews">
            <span className="material-symbols-outlined">reviews</span>
            <span>Đánh giá khách</span>
            {renderCountBadge(metrics.pendingReviewsCount, "blue")}
          </NavLink>
        </nav>

        <div className="mt-auto border-t border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
              {getInitials(user?.fullName || user?.email)}
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user?.fullName || "Chủ trọ"}</p>
              <p className="truncate text-xs text-slate-500">{user?.email || "Chưa cập nhật email"}</p>
            </div>
            <button className="text-slate-400 transition-colors hover:text-red-500" onClick={handleLogout} type="button">
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex min-h-[89px] items-center justify-between border-b border-slate-200 bg-white/95 px-8 py-4 backdrop-blur-md">
          <div className="min-w-0 pr-6">
            <h2 className="truncate text-2xl font-bold tracking-tight text-slate-900">{pageMeta.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{pageMeta.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100"
              type="button"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary"></span>
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100"
              type="button"
            >
              <span className="material-symbols-outlined">help</span>
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const LandlordLayout = () => (
  <LandlordMetricsProvider>
    <LandlordLayoutContent />
  </LandlordMetricsProvider>
);

export default LandlordLayout;
