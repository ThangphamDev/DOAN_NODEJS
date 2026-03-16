import { features } from "@/components/home/homeData";
const featureIcons = [
  <svg viewBox="0 0 24 24" key="chat"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  <svg viewBox="0 0 24 24" key="cal"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  <svg viewBox="0 0 24 24" key="star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  <svg viewBox="0 0 24 24" key="heart"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
];

const featureDescs = [
  "Nhắn tin trực tiếp, không cần chia sẻ số điện thoại cá nhân, an toàn và tiện lợi.",
  "Chọn ngày giờ phù hợp, chủ trọ xác nhận lịch ngay trên ứng dụng, có nhắc hẹn tự động.",
  "Xếp hạng sao và nhận xét thực từ người đã thuê, giúp bạn chọn phòng chính xác hơn.",
  "Lưu phòng ưng ý để so sánh sau, nhận thông báo khi phòng có thay đổi giá hoặc tình trạng.",
];

const FeaturesSection = () => {
  return (
    <section className="features-section">
      <div className="features-grid">
        <div className="features-visual">
          <div className="feature-mockup">
            <div className="mockup-header">
              <div className="mockup-title">Tin nhắn với chủ trọ</div>
              <span className="mockup-badge">Online</span>
            </div>
            <div className="chat-messages">
              <div className="chat-msg host">
                <div className="msg-bubble">Chào bạn, phòng vẫn còn trống. Bạn muốn đặt lịch xem không?</div>
                <div className="msg-time">10:32</div>
              </div>
              <div className="chat-msg guest">
                <div className="msg-bubble">Vâng, anh ơi! Cho em hỏi phòng có điều hoà chưa ạ?</div>
                <div className="msg-time">10:34</div>
              </div>
              <div className="chat-msg host">
                <div className="msg-bubble">Có rồi em, điều hoà inverter mới lắp tháng trước nhé. Giá điện tính theo số.</div>
                <div className="msg-time">10:35</div>
              </div>
              <div className="chat-msg guest">
                <div className="msg-bubble">Em muốn xem thứ 7 này được không ạ?</div>
                <div className="msg-time">10:36</div>
              </div>
            </div>
            <div className="chat-input-row">
              <div className="chat-input-mock">Nhắn tin...</div>
              <button type="button" className="chat-send">
                <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="features-content">
          <span className="section-label">Tính năng nổi bật</span>
          <h2 className="section-title">Kết nối <em>trực tiếp</em><br />không qua trung gian</h2>
          <ul className="features-list">
            {features.map((feature, i) => (
              <li key={feature.title} className="feature-item">
                <div className="feature-icon-sm">{featureIcons[i]}</div>
                <div>
                  <div className="feature-item-title">{feature.title}</div>
                  <div className="feature-item-desc">{featureDescs[i]}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;