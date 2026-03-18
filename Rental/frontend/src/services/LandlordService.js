import api from "@/api/client";

class LandlordService {
  getMyRooms(status) {
    const params = status ? { status } : undefined;
    return api.get("/landlord/rooms/me", { params });
  }

  getAppointments() {
    return api.get("/appointments/me");
  }

  createRoom(payload) {
    const formData = new FormData();
    formData.append("title", payload.title || "");
    formData.append("price", payload.price || "");
    formData.append("area", payload.area || "");
    formData.append("address", payload.address || "");
    formData.append("description", payload.description || "");

    (payload.images || []).forEach((file) => {
      formData.append("images", file);
    });

    return api.post("/rooms", formData);
  }

  updateAppointmentStatus(id, status, rejectReason = "") {
    return api.patch(`/appointments/${id}/status`, { status, rejectReason });
  }

  updateRoom(id, payload) {
    return api.patch(`/rooms/${id}`, payload);
  }

  deleteRoom(id) {
    return api.delete(`/rooms/${id}`);
  }

  replyReview(reviewId, content) {
    return api.put(`/reviews/${reviewId}/reply`, { content });
  }
}

export default new LandlordService();