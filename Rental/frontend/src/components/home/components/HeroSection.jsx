import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="hero-wrapper">
      <div className="hero-inner">
        {/* Left — Content */}
        <div className="anim-delay-1">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-dot">
              <svg viewBox="0 0 16 16" fill="none" width="10" height="10">
                <path d="M8 1.5L14 6v8H10V10H6v4H2V6L8 1.5z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            Nền tảng tìm trọ #1 Việt Nam
          </div>

          <h1>
            Tìm phòng trọ <em>ưng ý</em>
            <br />trong vài phút
          </h1>

          <p className="hero-sub">
            Hàng nghìn phòng trọ, căn hộ dịch vụ tại TP.HCM và các tỉnh lớn.
            Chat trực tiếp với chủ trọ — nhanh, an toàn, tiết kiệm.
          </p>

          <div className="hero-cta">
            <a href="#search" className="btn-hero">
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Tìm phòng ngay
            </a>
            <Link to="/register" className="btn-secondary-hero">
              Đăng tin cho thuê
            </Link>
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

        {/* Right — Visual card */}
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
              <div className="hero-card-img-inner" />
            </div>
            <div className="hero-card-body">
              <div className="card-location">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                </svg>
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
            <div className="float-badge__label">Mới nhất hôm nay</div>
            <div className="float-badge__value">+148 tin đăng</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;