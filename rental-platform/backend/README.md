# Backend - Rental Platform

## Tech stack
- Node.js + Express
- Sequelize + MySQL
- Socket.IO

## Architecture
- Controller -> Service -> Repository -> Entity
- Endpoints are registered directly in controllers via `registerRoutes(app, "/api")`
- Standard API response:
  - Success: `{ success, message, data, meta? }`
  - Error: `{ success: false, message }`

## Environment variables
Create `.env` in `backend/`:

```env
PORT=5000
CORS_ORIGIN=http://localhost:5173

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=rental_platform
DB_USER=root
DB_PASSWORD=your_password
DB_SYNC=true
DB_SYNC_ALTER=true

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

## Run
```bash
npm install
npm run dev
```

## Test
```bash
npm test
```

Current scope includes unit tests for:
- Auth service
- Room service
- Appointment service

## Key implementation notes
- Multi-write flow `createRoom + roomImages` uses Sequelize transaction.
- Repository layer is standardized with explicit methods:
  - `getById`, `getOne`, `getList`, `getListWithCount`, `insert`, `updateById`, `deleteById`, `incrementById`.
