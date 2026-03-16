# Kế hoạch triển khai theo phase (FE riêng, BE riêng)

Ngày lập kế hoạch: 2026-03-16
Mục tiêu: triển khai theo từng phase rõ ràng, có thể theo dõi tiến độ hàng tuần.

---

## 1) Phase Frontend (theo từng trang)

### FE-P0 — Ổn định nền tảng UI/API (2-3 ngày)
Phạm vi:
- Chuẩn hóa parse response API ở toàn bộ page/service.
- Chuẩn loading, empty state, error state dùng chung.
- Chuẩn role redirect sau đăng nhập.

Đầu ra:
- FE gọi API ổn định, không lỗi do lệch contract.
- Có khung trạng thái dùng lại cho các trang.

---

### FE-P1 — Trang Auth (Login, Register) (1-2 ngày)
Trang:
- LoginPage
- RegisterPage

Việc chính:
- Validate form phía client.
- Hiển thị lỗi thân thiện.
- Điều hướng theo role sau login/register.

Đầu ra:
- Auth flow hoàn chỉnh cho customer/landlord/admin.

---

### FE-P2 — Trang Home + Search + Listing (2-3 ngày)
Trang:
- HomePage
- HeroSection, SearchSection, ListingsSection, HowItWorksSection, FeaturesSection, TestimonialsSection, CtaSection

Việc chính:
- Search theo khu vực, khoảng giá, quick filter.
- Gắn query params rõ ràng.
- Tối ưu trải nghiệm danh sách phòng.

Đầu ra:
- Home hoạt động đúng nghiệp vụ tìm kiếm/lọc.

---

### FE-P3 — Trang Room Detail (2-3 ngày)
Trang:
- RoomDetailPage

Việc chính:
- Hiển thị chi tiết phòng + ảnh + đánh giá.
- Nút yêu thích.
- Form đặt lịch xem phòng.
- Form gửi đánh giá sao + nội dung.

Đầu ra:
- Khách hàng thao tác đầy đủ tại trang chi tiết.

---

### FE-P4 — Trang Chat realtime (2-4 ngày)
Trang:
- ChatPage

Việc chính:
- Danh sách hội thoại.
- Mở hội thoại theo peer/room.
- Gửi nhận realtime qua socket.
- Trạng thái kết nối và lỗi.

Đầu ra:
- Chat dùng được cho customer và landlord.

---

### FE-P5 — Trang chủ trọ (Landlord Dashboard) (3-5 ngày)
Trang:
- LandlordDashboardPage

Việc chính:
- Đăng tin mới có upload nhiều ảnh (multipart/form-data).
- Sửa/Xóa/Ẩn tin.
- Danh sách lịch hẹn + duyệt/từ chối.
- Truy cập nhanh tới chat theo khách.

Đầu ra:
- Chủ trọ vận hành được toàn bộ luồng chính.

---

### FE-P6 — Trang Admin (2-3 ngày)
Trang:
- AdminDashboardPage

Việc chính:
- Danh sách tin vi phạm + xóa.
- Danh sách người dùng + khóa tài khoản.
- Filter/pagination cơ bản.

Đầu ra:
- Admin xử lý moderation hiệu quả.

---

### FE-P7 — Hoàn thiện UX & bàn giao FE (2-3 ngày)
Phạm vi:
- Rà lỗi UI, responsive, thông báo người dùng.
- Dọn code, tách component chung nếu cần.
- Smoke test toàn bộ route FE.

Đầu ra:
- FE sẵn sàng tích hợp release.


## 2) Phase Backend (theo module)

### BE-P0 — Ổn định contract & bug blocker (2-3 ngày)
Phạm vi:
- Chốt response contract thống nhất.
- Sửa bug field/param chat.
- Chốt chuẩn upload ảnh phòng (multer + payload).

Đầu ra:
- API contract ổn định cho FE tích hợp.

---

### BE-P1 — Auth & Authorization (1-2 ngày)
Module:
- authController/service
- middleware auth/authorize

Việc chính:
- Kiểm tra role gate đầy đủ.
- Kiểm tra account bị khóa.
- Củng cố lỗi xác thực nhất quán.

Đầu ra:
- Xác thực/phân quyền chắc chắn.

---

### BE-P2 — Room & Listing API (2-3 ngày)
Module:
- roomController/service
- landlord/roomController/service

Việc chính:
- List/filter/pagination ổn định.
- Detail phòng + relations.
- Create/update/delete/hidden phòng.
- Upload ảnh và xử lý transaction.

Đầu ra:
- API phòng hoàn chỉnh cho customer + landlord.

---

### BE-P3 — Favorite, Review, Appointment (2-4 ngày)
Module:
- favoriteController/service
- reviewController/service
- appointmentController + landlord/appointmentController

Việc chính:
- Toggle favorite.
- Tạo review và lấy review theo phòng.
- Tạo lịch hẹn + đổi trạng thái lịch hẹn.

Đầu ra:
- Luồng thuê phòng đầy đủ nghiệp vụ.

---

### BE-P4 — Chat realtime (2-4 ngày)
Module:
- chatController/service
- socket

Việc chính:
- API lưu/lấy hội thoại.
- Phát sự kiện realtime ổn định.
- Đồng bộ auth token cho socket.

Đầu ra:
- Hệ chat ổn định, theo user room channel.

---

### BE-P5 — Admin moderation (1-2 ngày)
Module:
- admin/roomController/service
- admin/userController/service

Việc chính:
- Danh sách phòng bị report.
- Xóa tin vi phạm.
- Danh sách user + khóa user.

Đầu ra:
- Bộ API quản trị sẵn sàng dùng thực tế.

---

### BE-P6 — Test, hardening, release (2-4 ngày)
Phạm vi:
- Bổ sung unit test thiếu.
- Manual checklist E2E.
- Chuẩn hóa error message và logging.

Đầu ra:
- Backend sẵn sàng staging/production.


## 3) File tiến độ (tracker)

## Tiến độ tổng
| Mã phase | Nhóm | Trạng thái | ETA | Owner | Ghi chú |
|---|---|---|---|---|---|
| FE-P0 | Frontend | DONE | 2026-03-16 | Copilot | Chuẩn hóa parse response + helper dùng chung |
| FE-P1 | Frontend | DONE | 2026-03-16 | Copilot | Validate form + lỗi thân thiện + redirect theo role |
| FE-P2 | Frontend | DONE | 2026-03-16 | Copilot | Home/Search/Listings lấy data đúng contract |
| FE-P3 | Frontend | DONE | 2026-03-16 | Copilot | Room detail xử lý action + lỗi tốt hơn |
| FE-P4 | Frontend | DONE | 2026-03-16 | Copilot | Chat page hỗ trợ roomId + parse data chuẩn |
| FE-P5 | Frontend | DONE | 2026-03-16 | Copilot | Dashboard chủ trọ upload ảnh multipart + lịch hẹn |
| FE-P6 | Frontend | DONE | 2026-03-16 | Copilot | Dashboard admin parse data chuẩn + lỗi thao tác |
| FE-P7 | Frontend | DOING |  |  | Còn polish UI/UX và rà toàn tuyến |
| BE-P0 | Backend | DONE | 2026-03-16 | Copilot | Auto create DB (XAMPP) + seed dữ liệu demo |
| BE-P1 | Backend | DONE | 2026-03-16 | Copilot | Chuẩn hóa lỗi auth/authorize theo contract |
| BE-P2 | Backend | DONE | 2026-03-16 | Copilot | Room/listing API đã dùng ổn định qua FE |
| BE-P3 | Backend | DONE | 2026-03-16 | Copilot | Favorite/review/appointment đang chạy với FE |
| BE-P4 | Backend | DONE | 2026-03-16 | Copilot | Fix bug chat controller receiverId |
| BE-P5 | Backend | DONE | 2026-03-16 | Copilot | Admin flow đã tích hợp FE |
| BE-P6 | Backend | DONE | 2026-03-16 | Copilot | Unit test pass: 5 suites/61 tests |

Quy ước trạng thái:
- TODO: chưa làm
- DOING: đang triển khai
- BLOCKED: bị chặn
- REVIEW: chờ review/test
- DONE: hoàn thành

## Cập nhật tuần
### Tuần 1
- Mục tiêu:
- Hoàn thành:
- Rủi ro:
- Kế hoạch tuần sau:

### Tuần 2
- Mục tiêu:
- Hoàn thành:
- Rủi ro:
- Kế hoạch tuần sau:

### Tuần 3
- Mục tiêu:
- Hoàn thành:
- Rủi ro:
- Kế hoạch tuần sau:
