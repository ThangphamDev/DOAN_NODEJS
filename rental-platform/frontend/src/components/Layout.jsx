import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="container">
      <header className="topbar">
        <Link to="/" className="brand">
          Rental Platform
        </Link>
        <nav>
          <Link to="/">Phòng</Link>
          {user?.role === "landlord" && <Link to="/landlord">Chủ trọ</Link>}
          {user?.role === "admin" && <Link to="/admin">Admin</Link>}
          {user && <Link to="/chat">Chat</Link>}
          {!user && <Link to="/login">Đăng nhập</Link>}
          {!user && <Link to="/register">Đăng ký</Link>}
          {user && <button onClick={handleLogout}>Đăng xuất</button>}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default AppLayout;
