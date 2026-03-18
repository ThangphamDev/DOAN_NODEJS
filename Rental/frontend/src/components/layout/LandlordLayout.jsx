import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import landlordService from "@/services/LandlordService";
import useAuth from "@/hooks/useAuth";
import { getApiData } from "@/utils/apiResponse";

const LandlordLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadAppointments = async () => {
      try {
        const response = await landlordService.getAppointments();
        if (!isMounted) return;
        setAppointments(getApiData(response, []));
      } catch {
        if (!isMounted) return;
        setAppointments([]);
      }
    };

    loadAppointments();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const newMessages = appointments.filter((item) => item.status === "approved").length;
    return { newMessages };
  }, [appointments]);

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
    `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${isActive ? "bg-primary/10 font-medium text-primary" : "text-slate-600 hover:bg-slate-100"
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
            <p className="text-xs text-slate-500">Khu vực Chủ trọ</p>
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
          </NavLink>

          <NavLink className={navClassName} to="/landlord/appointments">
            <span className="material-symbols-outlined">event_note</span>
            <span>Quản lý lịch hẹn</span>
          </NavLink>

          <NavLink className={navClassName} to="/landlord/messages">
            <span className="material-symbols-outlined">forum</span>
            <span>Tin nhắn</span>
            <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {metrics.newMessages}
            </span>
          </NavLink>

          <NavLink className={navClassName} to="/landlord/reviews">
            <span className="material-symbols-outlined">reviews</span>
            <span>Đánh giá khách</span>
          </NavLink>
        </nav>

        <div className="mt-auto border-t border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
              {getInitials(user?.fullName || user?.email)}
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user?.fullName || "Chủ Trọ"}</p>
              <p className="truncate text-xs text-slate-500">{user?.email || "Chưa cập nhật email"}</p>
            </div>
            <button className="text-slate-400 transition-colors hover:text-red-500" onClick={handleLogout} type="button">
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md">
          <div className="flex max-w-xl flex-1 items-center gap-4">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400">search</span>
              <input
                className="w-full rounded-lg border-none bg-slate-100 py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50"
                placeholder="Tìm kiếm tin bài, bài viết..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100" type="button">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary"></span>
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100" type="button">
              <span className="material-symbols-outlined">help</span>
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-8 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default LandlordLayout;
