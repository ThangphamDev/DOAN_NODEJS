import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section>
      <div className="hero">
        {/* Left */}
        <div className="anim-delay-1">
          <div className="hero-label">
            <span></span> Nền tảng tìm trọ #1 Việt Nam
          </div>
          <h1>Tìm phòng trọ <em>ưng ý</em> trong vài phút</h1>
          <p className="hero-sub">
            Hàng nghìn phòng trọ, căn hộ dịch vụ tại TP.HCM và các tỉnh lớn. Xem thực tế, chat trực tiếp với chủ trọ — nhanh, an toàn, tiết kiệm.
          </p>
          <div className="hero-cta">
            <a href="#search" className="btn-hero">Tìm phòng ngay</a>
            <Link to="/register" className="btn-secondary-hero">Đăng tin cho thuê</Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-num">12.400+</div>
              <div className="stat-label">Phòng đang cho thuê</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">98%</div>
              <div className="stat-label">Khách hàng hài lòng</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">500+</div>
              <div className="stat-label">Chủ trọ uy tín</div>
            </div>
          </div>
        </div>

        {/* Right visual */}
        <div className="hero-visual anim-delay-2">
          <div className="float-badge float-badge-1">
            <div className="badge-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 12.79a19.79 19.79 0 01-3.07-8.67A2 2 0 011.94 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
            </div>
            <div>
              <div className="badge-text">Chat trực tiếp</div>
              <div className="badge-sub">Nhắn tin realtime</div>
            </div>
          </div>

          <div className="hero-card-main">
            <div className="hero-card-img">
              <div className="hero-card-img-inner">
                <svg className="room-svg-preview" viewBox="0 0 400 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="20" y="40" width="120" height="80" rx="4" fill="rgba(255,255,255,0.12)" />
                  <rect x="30" y="60" width="40" height="30" rx="3" fill="rgba(255,255,255,0.2)" />
                  <rect x="80" y="70" width="50" height="20" rx="3" fill="rgba(255,255,255,0.15)" />
                  <rect x="160" y="60" width="80" height="60" rx="4" fill="rgba(255,255,255,0.1)" />
                  <rect x="170" y="80" width="30" height="25" rx="2" fill="rgba(255,255,255,0.2)" />
                  <rect x="210" y="85" width="25" height="20" rx="2" fill="rgba(255,255,255,0.15)" />
                  <rect x="260" y="50" width="110" height="70" rx="4" fill="rgba(255,255,255,0.12)" />
                  <rect x="270" y="65" width="90" height="40" rx="3" fill="rgba(255,255,255,0.18)" />
                  <line x1="0" y1="140" x2="400" y2="140" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <rect x="0" y="140" width="400" height="20" fill="rgba(0,0,0,0.15)" />
                </svg>
              </div>
            </div>
            <div className="hero-card-body">
              <div className="card-location">
                <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" /></svg>
                Quận 3, TP.HCM
              </div>
              <div className="card-title">Căn hộ Studio sạch sẽ, đủ nội thất</div>
              <div className="card-row">
                <div className="card-price">3.500.000 <span>đ/tháng</span></div>
                <div className="card-rating">
                  <span className="stars">★★★★★</span>
                  <strong>4.9</strong>
                </div>
              </div>
              <div className="card-tags">
                <span className="tag">Wifi tốc độ cao</span>
                <span className="tag green">Còn trống</span>
                <span className="tag orange">Điều hoà</span>
              </div>
            </div>
          </div>

          <div className="float-badge float-badge-2">
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Mới nhất hôm nay</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>+148 tin đăng</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;