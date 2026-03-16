import api from "@/api/client";

class RoomService {
  listRooms(params) {
    return api.get("/rooms", { params });
  }

  getRoomDetail(id) {
    return api.get(`/rooms/${id}`);
  }

  toggleFavorite(id) {
    return api.post(`/favorites/${id}/toggle`);
  }

  createAppointment(id, payload) {
    return api.post(`/appointments/room/${id}`, payload);
  }

  createReview(id, payload) {
    return api.post(`/reviews/room/${id}`, payload);
  }
}

export default new RoomService();