import { Navigate, useLocation } from "react-router-dom";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import useAuth from "@/hooks/useAuth";

const AppLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const canAdminViewPublicPage = location.pathname === "/rooms" || location.pathname.startsWith("/rooms/");

  if (!loading && user?.role === "admin" && !canAdminViewPublicPage) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="app-main">{children}</main>
      <SiteFooter />
    </div>
  );
};

export default AppLayout;
