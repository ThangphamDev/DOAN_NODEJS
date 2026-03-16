import { steps } from "@/components/home/homeData";
const stepIcons = [
  <svg viewBox="0 0 24 24" key="search"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  <svg viewBox="0 0 24 24" key="eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  <svg viewBox="0 0 24 24" key="chat"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  <svg viewBox="0 0 24 24" key="check"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
];

const stepDescs = [
  "Nhập khu vực, mức giá, tiện ích mong muốn. Bộ lọc thông minh giúp thu hẹp kết quả chính xác.",
  "Hình ảnh thực tế, bản đồ vị trí, đánh giá từ khách ở trước — đầy đủ thông tin trước khi liên hệ.",
  "Nhắn tin trực tiếp, hỏi đáp nhanh, đặt lịch hẹn xem phòng ngay trong ứng dụng.",
  "Ký hợp đồng, nhận chìa khoá. Để lại đánh giá giúp cộng đồng thuê trọ an toàn hơn.",
];

const HowItWorksSection = () => {
  return (
    <section className="how-section">
      <div className="how-inner">
        <div className="how-title">Tìm phòng <em>chưa bao giờ</em> dễ đến vậy</div>
        <p className="how-sub">Quy trình đơn giản, minh bạch — từ tìm kiếm đến dọn vào ở chỉ trong vài ngày.</p>
        <div className="steps-grid">
          {steps.map((step, i) => (
            <div key={step.id} className="step-card">
              <div className="step-num">Bước {step.id}</div>
              <div className="step-icon">{stepIcons[i]}</div>
              <div className="step-title">{step.title}</div>
              <p className="step-desc">{stepDescs[i]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;