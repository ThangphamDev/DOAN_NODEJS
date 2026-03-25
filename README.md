# 🏠 Rental Platform – Room Rental & Booking System

A full-stack web application that connects **tenants and landlords** through a modern rental platform, supporting room browsing, booking appointments, real-time chat, and administrative management.

---

## 📌 Overview

**Rental Platform** is a web-based system designed to simplify the process of finding and managing rental rooms. The system supports three main roles:

- 👤 **Customer** – Browse rooms, book appointments, chat with landlords  
- 🏠 **Landlord** – Manage rooms, handle bookings, communicate with customers  
- 🛠 **Admin** – Moderate system, manage users, rooms, and reports  

This project is built as a **fullstack application** using modern technologies with a scalable architecture.

---

## 🚀 Key Features

### 👤 Customer
- Browse and search rental rooms
- View room details (images, price, location)
- Add/remove favorites
- Book viewing appointments
- Chat with landlords (real-time)
- Leave reviews after booking

### 🏠 Landlord
- Create, update, delete rooms
- Manage room images
- View and manage appointments
- Chat with customers
- Respond to reviews

### 🛠 Admin
- Manage users (ban/unban)
- Manage rooms (approve/remove)
- Handle reports (room/user reports)
- Monitor system activity

---

## 🧱 System Architecture

The backend follows a **layered architecture**:

Controller -> Service -> Repository -> Entity (Sequelize)

- **Controller**: Handle HTTP requests  
- **Service**: Business logic  
- **Repository**: Data access  
- **Entity**: Database models  

---

## 🛠 Tech Stack

### Backend
- Node.js
- Express.js (v5)
- Sequelize ORM
- MySQL
- Socket.IO (real-time chat)
- JWT Authentication

### Frontend
- React 19
- Vite
- React Router v7
- Axios
- Socket.IO Client

### Tools
- ESLint
- Nodemon
- Jest (unit testing)

---

## 📁 Project Structure

Rental/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── entities/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── sockets/
│   ├── tests/
│   └── uploads/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── config files
│
├── docs/
│   ├── mockups (HTML)
│   └── audit & planning
│
└── README.md

---

## ⚙️ Installation & Setup

### 1. Clone repository
git clone https://github.com/ThangphamDev/DOAN_NODEJS.git  
cd DOAN_NODEJS/Rental  

---

### 2. Backend Setup

cd backend  
npm install  

Create `.env` file:

PORT=5000  
DB_HOST=localhost  
DB_USER=root  
DB_PASSWORD=your_password  
DB_NAME=rental_db  
JWT_SECRET=your_secret_key  

Run backend:

npm run dev  

---

### 3. Frontend Setup

cd frontend  
npm install  
npm run dev  

Frontend URL:

http://localhost:5173  

---

## 🧪 Testing

cd backend  
npm test  

---

## 🔑 Demo Accounts

| Role       | Email              | Password |
|------------|--------------------|----------|
| Customer   | customer@test.com  | 123456   |
| Landlord   | landlord@test.com  | 123456   |
| Admin      | admin@test.com     | 123456   |

---

## 🔌 API Base URL

http://localhost:5000/api

---

## 💬 Real-time Features

- Chat system using Socket.IO  
- Real-time messaging  
- Basic online/offline tracking  

---

## ⚠️ Current Limitations

- Missing input validation  
- Upload chưa secure  
- Chưa có rate limit  
- Admin thiếu pagination/search  
- Docs frontend chưa hoàn chỉnh  
- Mockup HTML cũ  
- sequelize.sync alter chưa phù hợp production  

---

## 🛣 Roadmap

- Validation (Joi/Zod)  
- Security improvements  
- Docker  
- Notification system  
- UI responsive  
- Forgot password  
- Deploy cloud  

---

## 👨‍💻 Author

Thắng Phạm Xuân  
GitHub: https://github.com/ThangphamDev  

---

## 📄 License

Educational purpose

---

## ⭐ Final Notes

Project demonstrates:
- Fullstack development  
- REST API design  
- WebSocket (real-time)  
- RBAC (role-based access control)  
- Scalable architecture  
