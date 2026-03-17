import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

const SiteHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onEscape = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <nav aria-label="Điều hướng chính">
        <div className="nav-inner">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V21H15v-5h-6v5H3V9.5z" /></svg>
          </div>
          Livin<span className="logo-dot">X</span>
        </Link>

        <ul id="site-primary-nav" className="nav-links">
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
              <Link to="/login" className="ui-button ui-button--outline nav-button">Đăng nhập</Link>
              <Link to="/register" className="ui-button ui-button--primary nav-button">Đăng ký miễn phí</Link>
            </>
          )}
          {user && (
            <>
              <span className="nav-user-pill">{user.fullName || user.email}</span>
              {user.role === "customer" && <Link to="/messages" className="ui-button ui-button--outline nav-button">Tin nhắn</Link>}
              {user.role === "landlord" && <Link to="/landlord" className="ui-button ui-button--outline nav-button">Bảng chủ trọ</Link>}
              {user.role === "admin" && <Link to="/admin" className="ui-button ui-button--outline nav-button">Bảng admin</Link>}
              <button type="button" className="ui-button ui-button--primary nav-button" onClick={handleLogout}>Đăng xuất</button>
            </>
          )}
        </div>

        {(user?.role === "customer" || user?.role === "landlord") && (
          <Link to="/messages" className="ui-button ui-button--outline nav-mobile-message" onClick={() => setMobileMenuOpen(false)}>
            Tin nhắn
          </Link>
        )}

        <button
          type="button"
          className="ui-button ui-button--outline nav-menu-toggle"
          aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-header-menu"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          <span className="nav-menu-toggle__icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>
      </nav>

      <div
        className={`mobile-menu-backdrop ${mobileMenuOpen ? "is-open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      />

      <aside
        id="mobile-header-menu"
        className={`mobile-menu ${mobileMenuOpen ? "is-open" : ""}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="mobile-menu__header">
          <strong>Menu</strong>
          <button
            type="button"
            className="mobile-menu__close"
            aria-label="Đóng menu"
            onClick={() => setMobileMenuOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="mobile-menu__profile">
          <div className="mobile-menu__avatar">{(user?.fullName || user?.email || "G").slice(0, 1).toUpperCase()}</div>
          <div>
            <div className="mobile-menu__name">{user?.fullName || user?.email || "Khách"}</div>
            <div className="mobile-menu__role">
              {user ? (user.role === "admin" ? "Quản trị viên" : user.role === "landlord" ? "Chủ trọ" : "Thành viên") : "Chưa đăng nhập"}
            </div>
          </div>
        </div>

        <ul className="mobile-menu__links">
          <li><Link to="/" onClick={() => setMobileMenuOpen(false)}>Trang chủ</Link></li>
          <li><a href="#search" onClick={() => setMobileMenuOpen(false)}>Khu vực</a></li>
          <li><a href="#search" onClick={() => setMobileMenuOpen(false)}>Giá cả</a></li>
          {user?.role === "landlord" ? (
            <li><Link to="/landlord" onClick={() => setMobileMenuOpen(false)}>Trang chủ trọ</Link></li>
          ) : (
            <li><Link to="/register" onClick={() => setMobileMenuOpen(false)}>Đăng tin cho thuê</Link></li>
          )}
          {user?.role === "admin" && <li><Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Quản trị</Link></li>}
          {(user?.role === "customer" || user?.role === "landlord") && <li><Link to="/messages" onClick={() => setMobileMenuOpen(false)}>Tin nhắn</Link></li>}
        </ul>

        <div className="mobile-menu__actions">
          {!user && (
            <>
              <Link to="/login" className="ui-button ui-button--outline nav-button" onClick={() => setMobileMenuOpen(false)}>Đăng nhập</Link>
              <Link to="/register" className="ui-button ui-button--primary nav-button" onClick={() => setMobileMenuOpen(false)}>Đăng ký miễn phí</Link>
            </>
          )}
          {user && (
            <button type="button" className="ui-button ui-button--primary nav-button" onClick={handleLogout}>Đăng xuất</button>
          )}
        </div>
      </aside>
    </>
  );
};

export default SiteHeader;