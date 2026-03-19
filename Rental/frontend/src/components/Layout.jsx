import { Navigate } from "react-router-dom";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import useAuth from "@/hooks/useAuth";

const AppLayout = ({ children }) => {
  const { user, loading } = useAuth();

  if (!loading && user?.role === "admin") {
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
