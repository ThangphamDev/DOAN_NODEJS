import { Link } from "react-router-dom";
const CtaSection = () => {
  return (
    <section className="cta-section">
      <div className="cta-inner">
        <div className="cta-label">Miễn phí hoàn toàn</div>
        <h2 className="cta-title">Sẵn sàng tìm<br /><em>ngôi nhà mới</em> của bạn?</h2>
        <p className="cta-sub">Đăng ký miễn phí ngay hôm nay, khám phá hàng nghìn phòng trọ uy tín toàn quốc.</p>
        <div className="cta-actions">
          <Link to="/#search" className="btn-cta-white">Tìm phòng ngay</Link>
          <Link to="/register" className="btn-cta-outline">Đăng tin cho thuê</Link>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;