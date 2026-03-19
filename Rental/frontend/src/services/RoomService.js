import api from "@/api/client";

class RoomService {
  listRooms(params) {
    return api.get("/rooms", { params });
  }

  getRoomDetail(id) {
    return api.get(`/rooms/${id}`);
  }

  getMyFavorites() {
    return api.get("/favorites/me");
  }

  getMyAppointments() {
    return api.get("/appointments/me");
  }

  cancelAppointment(id) {
    return api.patch(`/appointments/${id}/cancel`);
  }

  toggleFavorite(id) {
    return api.post(`/favorites/${id}/toggle`);
  }

  getReportStatus(id) {
    return api.get(`/rooms/${id}/report-status`);
  }

  createAppointment(id, payload) {
    return api.post(`/appointments/room/${id}`, payload);
  }

  createReview(id, payload) {
    return api.post(`/reviews/room/${id}`, payload);
  }

  reportRoom(id, payload) {
    return api.post(`/rooms/${id}/report`, payload);
  }
}

export default new RoomService();
