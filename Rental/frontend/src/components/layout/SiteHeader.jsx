import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

const SiteHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav>
      <div className="nav-inner">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V21H15v-5h-6v5H3V9.5z" /></svg>
          </div>
          Tro<span className="logo-dot">Tốt</span>
        </Link>

        <ul className="nav-links">
          <li><Link to="/">Tìm phòng</Link></li>
          <li><a href="#search">Khu vực</a></li>
          <li><a href="#search">Giá cả</a></li>
          {user?.role === "landlord" ? (
            <li><Link to="/landlord">Trang chủ trọ</Link></li>
          ) : (
            <li><Link to="/register">Đăng tin</Link></li>
          )}
          {user?.role === "admin" && <li><Link to="/admin">Quản trị</Link></li>}
        </ul>

        <div className="nav-actions">
          {!user && (
            <>
              <Link to="/login" className="btn-ghost">Đăng nhập</Link>
              <Link to="/register" className="btn-primary">Đăng ký miễn phí</Link>
            </>
          )}
          {user && (
            <>
              <span className="nav-user-pill">{user.fullName || user.email}</span>
              {user.role === "customer" && <Link to="/chat" className="btn-ghost">Chat</Link>}
              <button type="button" className="btn-primary" onClick={handleLogout}>Đăng xuất</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default SiteHeader;