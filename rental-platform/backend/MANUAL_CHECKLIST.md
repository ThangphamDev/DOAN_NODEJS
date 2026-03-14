# Manual End-to-End Checklist (Backend)

## 1) Health & auth
- [ ] `GET /api/health` returns `{ success: true, data.status: "ok" }`
- [ ] Register customer: `POST /api/auth/register`
- [ ] Login customer: `POST /api/auth/login`
- [ ] `GET /api/auth/me` with bearer token

## 2) Room flow
- [ ] Landlord creates room: `POST /api/rooms` (multipart + images)
- [ ] Public room list: `GET /api/rooms`
- [ ] Public room detail: `GET /api/rooms/:id`
- [ ] Customer report room: `POST /api/rooms/:id/report`

## 3) Favorite & review flow
- [ ] Toggle favorite: `POST /api/favorites/:roomId/toggle`
- [ ] Get my favorites: `GET /api/favorites/me`
- [ ] Create review: `POST /api/reviews/room/:roomId`
- [ ] Get room reviews: `GET /api/reviews/room/:roomId`

## 4) Appointment flow
- [ ] Customer creates appointment: `POST /api/appointments/room/:roomId`
- [ ] Customer/landlord list appointments: `GET /api/appointments/me`
- [ ] Landlord updates status: `PATCH /api/appointments/:id/status`

## 5) Admin flow
- [ ] Admin area check: `GET /api/admin`
- [ ] Reported rooms: `GET /api/admin/rooms/reported`
- [ ] Delete violation room: `DELETE /api/admin/rooms/:id`
- [ ] Users list: `GET /api/admin/users`
- [ ] Lock user: `PATCH /api/admin/users/:id/lock`

## 6) Error contract
- [ ] Invalid token returns `{ success: false, message }`
- [ ] Forbidden role returns `{ success: false, message }`
- [ ] Validation/business errors return `{ success: false, message }` or success payload with non-2xx as designed
