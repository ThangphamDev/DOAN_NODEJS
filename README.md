# 🏠 Rental Platform – Fullstack Room Rental System

> A fullstack web application for managing rental rooms, supporting booking, real-time chat, and role-based system management.

---

## 🚀 Project Overview

Rental Platform is a fullstack application that connects **tenants and landlords** in a centralized system.  
Users can search rooms, book appointments, and communicate in real-time.

The system supports **3 main roles**:
- 👤 Customer
- 🏠 Landlord
- 🛠 Admin

---

## 🛠 Tech Stack

### Backend
- Node.js, Express.js
- Sequelize ORM
- MySQL
- JWT Authentication
- Socket.IO

### Frontend
- React (Vite)
- React Router
- Axios
- Socket.IO Client

---

## 🧠 My Contributions

- Designed and implemented **RESTful APIs**
- Built **layered architecture** (Controller → Service → Repository)
- Implemented **JWT authentication & RBAC**
- Developed **real-time chat system (Socket.IO)**
- Designed database schema using Sequelize
- Integrated frontend with backend APIs
- Wrote unit tests for core modules

---

## ✨ Key Features

### Customer
- Browse & search rooms
- View room details
- Add to favorites
- Book appointments
- Chat with landlords
- Leave reviews

### Landlord
- Manage rooms (CRUD)
- Manage bookings
- Chat with customers
- Reply to reviews

### Admin
- Manage users
- Moderate rooms
- Handle reports
- Monitor system

---

## 🧱 Architecture

Controller → Service → Repository → Entity

- Clean separation of concerns
- Scalable and maintainable design

---

## 📁 Project Structure

```bash
Rental/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Handle request/response
│   │   ├── services/         # Business logic
│   │   ├── repositories/     # Database layer
│   │   ├── entities/         # Sequelize models
│   │   ├── middlewares/      # Auth, validation
│   │   ├── routes/           # API routes
│   │   └── sockets/          # Real-time chat
│   ├── tests/                # Unit tests
│   └── uploads/              # Images
│
├── frontend/
│   ├── src/                  # React code
│   ├── public/               # Static files
│   └── config files
│
├── docs/
│   ├── mockups/
│   └── audit & planning
│
└── README.md
```

---

## 🔌 System Design

- RESTful API (`/api/...`)
- JWT Authentication
- Role-based access control (RBAC)
- Real-time messaging (Socket.IO)
- File upload support

---

## 🧪 Testing

- Jest unit tests
- Covered:
  - Auth Service
  - Room Service
  - Appointment Service

---

## ⚠️ Challenges & Improvements

### Challenges
- Real-time communication handling
- Role-based authorization logic
- Structuring scalable backend

### Improvements
- Add validation (Joi/Zod)
- Improve security (rate limit, upload filter)
- Add pagination & search
- Notification system
- Deployment (Docker, AWS)

---

## 📌 Highlights

- Fullstack real-world project
- Clean architecture design
- Real-time feature implemented
- Role-based system

---

## 👨‍💻 Author

**Thắng Phạm Xuân**  
GitHub: https://github.com/ThangphamDev
