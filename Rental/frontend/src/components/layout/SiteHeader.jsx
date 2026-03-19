import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

const roleLabelMap = {
  admin: "Quản trị viên",
  landlord: "Chủ trọ",
  customer: "Khách hàng",
};

const SiteHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen && !accountMenuOpen) return undefined;

    const onEscape = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setAccountMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [accountMenuOpen, mobileMenuOpen]);

  useEffect(() => {
    if (!accountMenuOpen) return undefined;

    const handleClickOutside = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [accountMenuOpen]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
    navigate("/");
  };

  const primaryLinks = useMemo(() => {
    if (user?.role === "landlord") {
      return [{ to: "/landlord", label: "Bảng chủ trọ" }];
    }

    if (user?.role === "admin") {
      return [{ to: "/admin", label: "Quản trị" }];
    }

    const links = [
      { to: "/", label: "Trang chủ" },
      { to: "/rooms", label: "Tìm phòng" },
    ];

    if (user?.role === "customer") {
      links.push({ to: "/appointments", label: "Lịch hẹn" });
      links.push({ to: "/messages", label: "Tin nhắn" });
    }

    return links;
  }, [user?.role]);

  const accountItems = useMemo(() => {
    if (!user) return [];

    if (user.role === "customer") {
      return [
        { to: "/favorites", label: "Phòng yêu thích" },
        { to: "/profile", label: "Hồ sơ" },
      ];
    }

    if (user.role === "landlord") {
      return [
        { to: "/profile", label: "Hồ sơ" },
        { to: "/landlord", label: "Bảng chủ trọ" },
      ];
    }

    return [{ to: "/admin", label: "Trang quản trị" }];
  }, [user]);

  const loginLink = user?.role === "admin" ? "/admin/login" : "/login";

  return (
    <>
      <nav aria-label="Điều hướng chính">
        <div className="nav-inner">
          <Link to={user?.role === "admin" ? "/admin" : "/"} className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24">
                <path d="M3 9.5L12 3l9 6.5V21H15v-5h-6v5H3V9.5z" />
              </svg>
            </div>
            Livin<span className="logo-dot">X</span>
          </Link>

          <ul id="site-primary-nav" className="nav-links">
            {primaryLinks.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            {!user ? (
              <>
                <Link to={loginLink} className="ui-button ui-button--outline nav-button">
                  Đăng nhập
                </Link>
                <Link to="/register" className="ui-button ui-button--primary nav-button">
                  Đăng ký miễn phí
                </Link>
              </>
            ) : (
              <div className="nav-account" ref={accountMenuRef}>
                <button
                  type="button"
                  className="nav-user-pill nav-user-pill--button"
                  onClick={() => setAccountMenuOpen((prev) => !prev)}
                  aria-expanded={accountMenuOpen}
                >
                  <span className="nav-user-pill__name">{user.fullName || user.email}</span>
                  <span className="material-symbols-outlined nav-user-pill__icon">expand_more</span>
                </button>

                {accountMenuOpen ? (
                  <div className="nav-account__menu">
                    <div className="nav-account__meta">
                      <strong>{user.fullName || user.email}</strong>
                      <span>{roleLabelMap[user.role] || "Thành viên"}</span>
                    </div>

                    <div className="nav-account__links">
                      {accountItems.map((item) => (
                        <Link key={item.to} to={item.to} onClick={() => setAccountMenuOpen(false)}>
                          {item.label}
                        </Link>
                      ))}
                      <button type="button" onClick={handleLogout}>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {user?.role === "customer" ? (
            <Link to="/messages" className="ui-button ui-button--outline nav-mobile-message" onClick={() => setMobileMenuOpen(false)}>
              Tin nhắn
            </Link>
          ) : null}

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
            <div className="mobile-menu__role">{user ? roleLabelMap[user.role] || "Thành viên" : "Chưa đăng nhập"}</div>
          </div>
        </div>

        <ul className="mobile-menu__links">
          {primaryLinks.map((item) => (
            <li key={item.to}>
              <Link to={item.to} onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}

          {user
            ? accountItems.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} onClick={() => setMobileMenuOpen(false)}>
                    {item.label}
                  </Link>
                </li>
              ))
            : null}
        </ul>

        <div className="mobile-menu__actions">
          {!user ? (
            <>
              <Link to={loginLink} className="ui-button ui-button--outline nav-button" onClick={() => setMobileMenuOpen(false)}>
                Đăng nhập
              </Link>
              <Link to="/register" className="ui-button ui-button--primary nav-button" onClick={() => setMobileMenuOpen(false)}>
                Đăng ký miễn phí
              </Link>
            </>
          ) : (
            <button type="button" className="ui-button ui-button--primary nav-button" onClick={handleLogout}>
              Đăng xuất
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default SiteHeader;
