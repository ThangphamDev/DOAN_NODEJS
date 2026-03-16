import api from "@/api/client";

class LandlordService {
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

  updateAppointmentStatus(id, status) {
    return api.patch(`/appointments/${id}/status`, { status });
  }
}

export default new LandlordService();