Kiến trúc hiện tại (đã cập nhật)

Mục tiêu chính:
- Không dùng express.Router nữa.
- Endpoint được đăng ký trực tiếp trong controller qua hàm registerRoutes(app, prefix).
- Phân tầng OOP rõ ràng: Controller -> Service -> Repository -> Entity.


Backend

backend/
├── package.json
└── src/
    ├── app.js
    ├── server.js
    ├── socket.js
    │
    ├── config/
    │   └── database.js
    │
    ├── controllers/
    │   ├── authController.js
    │   ├── roomController.js
    │   ├── favoriteController.js
    │   ├── reviewController.js
    │   ├── appointmentController.js
    │   ├── chatController.js
    │   │
    │   ├── landlord/
    │   │   ├── roomController.js
    │   │   └── appointmentController.js
    │   │
    │   └── admin/
    │       ├── roomController.js
    │       └── userController.js
    │
    ├── services/
    │   ├── authService.js
    │   ├── roomService.js
    │   ├── favoriteService.js
    │   ├── reviewService.js
    │   ├── appointmentService.js
    │   ├── chatService.js
    │   │
    │   ├── landlord/
    │   │   ├── roomService.js
    │   │   └── appointmentService.js
    │   │
    │   └── admin/
    │       ├── roomService.js
    │       └── userService.js
    │
    ├── repositories/
    │   ├── userRepository.js
    │   ├── roomRepository.js
    │   ├── favoriteRepository.js
    │   ├── reviewRepository.js
    │   ├── appointmentRepository.js
    │   └── messageRepository.js
    │
    ├── entities/
    │   ├── index.js
    │   ├── user.js
    │   ├── room.js
    │   ├── roomImage.js
    │   ├── appointment.js
    │   ├── favorite.js
    │   ├── review.js
    │   └── message.js
    │
    ├── models/
    │   ├── index.js
    │   ├── userModel.js
    │   ├── roomModel.js
    │   ├── appointmentModel.js
    │   └── messageModel.js
    │
    ├── middleware/
    │   ├── auth.js
    │   ├── authorize.js
    │   ├── errorHandler.js
    │   └── validate.js
    │
    ├── validators/
    │   ├── authValidator.js
    │   ├── roomValidator.js
    │   ├── appointmentValidator.js
    │   └── reviewValidator.js
    │
    ├── utils/
    │   ├── token.js
    │   ├── upload.js
    │   ├── ApiError.js
    │   ├── ApiResponse.js
    │   └── pagination.js
    │
    ├── constants/
    │   └── roles.js
    │
    └── seeders/
        └── adminSeed.js


Frontend

frontend/
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── api/
    │   └── client.js
    ├── services/
    │   ├── AuthService.js
    │   ├── RoomService.js
    │   ├── ChatService.js
    │   ├── AdminService.js
    │   └── LandlordService.js
    ├── context/
    │   └── AuthContext.jsx
    ├── components/
    │   ├── Layout.jsx
    │   ├── ProtectedRoute.jsx
    │   └── common/
    ├── pages/
    │   ├── HomePage.jsx
    │   ├── RoomDetailPage.jsx
    │   ├── LoginPage.jsx
    │   ├── RegisterPage.jsx
    │   ├── ChatPage.jsx
    │   ├── admin/
    │   │   └── AdminDashboardPage.jsx
    │   └── landlord/
    │       └── LandlordDashboardPage.jsx
    ├── hooks/
    │   └── useAuth.js
    └── utils/
        └── storage.js


Luồng chạy backend hiện tại

1) app.js tạo Express app.
2) app.js gọi registerRoutes(app, "/api") của từng controller.
3) Mỗi controller đăng ký endpoint + middleware tương ứng.
4) Controller gọi Service (nghiệp vụ).
5) Service gọi Repository (truy vấn dữ liệu).
6) Repository thao tác Entity Sequelize.


Ghi chú thiết kế

- Controller: nhận req/res, validate luồng HTTP, không chứa truy vấn DB trực tiếp.
- Service: chứa nghiệp vụ, quy tắc domain.
- Repository: gom toàn bộ thao tác dữ liệu để dễ đổi DB/ORM.
- Entity: định nghĩa bảng + quan hệ trong Sequelize.
- Model (response model): map dữ liệu trả ra API.
