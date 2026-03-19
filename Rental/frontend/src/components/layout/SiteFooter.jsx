import { Link } from "react-router-dom";

const SiteFooter = () => {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V21H15v-5h-6v5H3V9.5z" /></svg>
              </div>
              Livin<span className="logo-dot">X</span>
            </Link>
            <p className="footer-desc footer-desc--spaced">
              Nền tảng kết nối người tìm phòng và chủ trọ uy tín, nhanh chóng, an toàn trên toàn Việt Nam.
            </p>
            <div className="footer-copy">© 2026 LivinX. All rights reserved.</div>
          </div>

          <div>
            <div className="footer-col-title">Khám phá</div>
            <ul className="footer-links">
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/rooms">Tìm phòng</Link></li>
              <li><Link to="/favorites">Phòng yêu thích</Link></li>
              <li><Link to="/register">Đăng tin cho thuê</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Hỗ trợ</div>
            <ul className="footer-links">
              <li><Link to="/appointments">Lịch hẹn của tôi</Link></li>
              <li><Link to="/messages">Tin nhắn</Link></li>
              <li><Link to="/profile">Hồ sơ cá nhân</Link></li>
              <li><a href="mailto:support@livinx.vn">Liên hệ chúng tôi</a></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Liên hệ</div>
            <ul className="footer-links">
              <li><a href="mailto:support@livinx.vn">support@livinx.vn</a></li>
              <li><a href="tel:+84000000000">0800 000 000</a></li>
              <li><Link to="/login">Đăng nhập</Link></li>
              <li><Link to="/admin/login">Cổng admin</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>Được xây dựng với ♥ tại TP.HCM, Việt Nam</span>
          <span>TP.HCM · Hà Nội · Đà Nẵng · Cần Thơ</span>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
