import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import landlordService from "@/services/LandlordService";
import useAuth from "@/hooks/useAuth";
import { getApiData } from "@/utils/apiResponse";

const baseNavClass =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors";

const LandlordLayout = () => {
  const { logout } = useAuth();
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

  const getNavClass = ({ isActive }) =>
    `${baseNavClass} ${isActive ? "active-nav" : "text-slate-600 hover:bg-slate-100"}`;

  const getMessageNavClass = ({ isActive }) =>
    `relative ${baseNavClass} ${isActive ? "active-nav" : "text-slate-600 hover:bg-slate-100"}`;

  return (
    <div className="flex min-h-screen bg-background-light font-display text-slate-900">
      <aside className="fixed flex h-full w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-full flex-col gap-6 p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-white">
              <span className="material-symbols-outlined">apartment</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold leading-none">PropManager</h1>
              <p className="mt-1 text-xs text-slate-500">Chủ trọ xác minh</p>
            </div>
          </div>

          <nav className="flex flex-grow flex-col gap-1">
            <NavLink className={getNavClass} to="/landlord" end>
              <span className="material-symbols-outlined">dashboard</span>
              Tổng quan
            </NavLink>
            <NavLink className={getNavClass} to="/landlord/rooms">
              <span className="material-symbols-outlined">home_work</span>
              Tin đăng
            </NavLink>
            <NavLink className={getNavClass} to="/landlord/appointments">
              <span className="material-symbols-outlined">event_note</span>
              Lịch hẹn
            </NavLink>
            <NavLink className={getMessageNavClass} to="/landlord/messages">
              <span className="material-symbols-outlined">chat_bubble</span>
              Tin nhắn
              <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-primary px-1.5 text-[10px] text-white">
                {metrics.newMessages}
              </span>
            </NavLink>
            <NavLink className={getNavClass} to="/landlord/reviews">
              <span className="material-symbols-outlined">reviews</span>
              Đánh giá
            </NavLink>
          </nav>

          <button
            className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
            onClick={handleLogout}
            type="button"
          >
            <span className="material-symbols-outlined">logout</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default LandlordLayout;
