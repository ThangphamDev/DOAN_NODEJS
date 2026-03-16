const SiteFooter = () => {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="logo">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V21H15v-5h-6v5H3V9.5z" /></svg>
              </div>
              Tro<span className="logo-dot">Tốt</span>
            </a>
            <p className="footer-desc" style={{ marginTop: "14px" }}>
              Nền tảng kết nối người tìm phòng và chủ trọ uy tín, nhanh chóng, an toàn trên toàn Việt Nam.
            </p>
            <div style={{ fontSize: "13px" }}>© 2026 TroTốt. All rights reserved.</div>
          </div>

          <div>
            <div className="footer-col-title">Khám phá</div>
            <ul className="footer-links">
              <li><a href="#">Tìm phòng</a></li>
              <li><a href="#">Phòng nổi bật</a></li>
              <li><a href="#">Bản đồ phòng trọ</a></li>
              <li><a href="#">Phòng mới nhất</a></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Hỗ trợ</div>
            <ul className="footer-links">
              <li><a href="#">Hướng dẫn thuê phòng</a></li>
              <li><a href="#">Hướng dẫn đăng tin</a></li>
              <li><a href="#">Chính sách bảo mật</a></li>
              <li><a href="#">Điều khoản sử dụng</a></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Liên hệ</div>
            <ul className="footer-links">
              <li><a href="#">Trung tâm hỗ trợ</a></li>
              <li><a href="#">Báo cáo vi phạm</a></li>
              <li><a href="#">Hợp tác doanh nghiệp</a></li>
              <li><a href="#">Blog &amp; Tin tức</a></li>
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