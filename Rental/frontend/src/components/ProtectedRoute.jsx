import { Navigate } from "react-router-dom";
import LoadingState from "@/components/common/LoadingState";
import useAuth from "@/hooks/useAuth";

const ProtectedRoute = ({ children, roles, redirectTo = "/login" }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState />;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
