import { testimonials } from "@/components/home/homeData";
const avatarColors = ["av-blue", "av-green", "av-orange"];
const avatarInitials = { "Minh Hùng": "MH", "Thanh Lan": "TL", "Quốc Anh": "QA" };
const tStars = ["★★★★★", "★★★★★", "★★★★☆"];
const tQuotes = [
  "\"Tìm được phòng ưng ý chỉ sau 2 ngày. Chat với chủ trọ rất nhanh, lịch hẹn xem phòng được duyệt trong vòng 1 tiếng. Trải nghiệm tốt hơn tôi nghĩ nhiều.\"",
  "\"Giao diện thân thiện, tìm kiếm nhanh và kết quả chính xác. Tính năng lọc theo giá rất hữu ích, giúp mình không mất thời gian xem những phòng không phù hợp túi tiền.\"",
  "\"Đánh giá từ người thuê trước rất thật và hữu ích. Mình đã tránh được 2 phòng trọ kém chất lượng nhờ đọc review trước khi đặt lịch. Tiết kiệm được nhiều thời gian.\"",
];

const TestimonialsSection = () => {
  return (
    <section className="testimonials-section">
      <div className="section-header">
        <h2 className="section-title">Khách hàng nói gì về <em>LivinX</em></h2>
      </div>
      <div className="testimonials-grid">
        {testimonials.map((item, i) => (
          <div key={item.name} className="testimonial-card">
            <div className="t-stars">{tStars[i]}</div>
            <p className="t-quote">{tQuotes[i]}</p>
            <div className="t-author">
              <div className={`t-avatar ${avatarColors[i]}`}>
                {avatarInitials[item.name] || item.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="t-name">{item.name}</div>
                <div className="t-meta">{item.meta}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;