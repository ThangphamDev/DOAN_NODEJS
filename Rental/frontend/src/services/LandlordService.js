import api from "@/api/client";

class LandlordService {
  getAppointments() {
    return api.get("/appointments/me");
  }

  createRoom(payload) {
    return api.post("/rooms", payload);
  }

  updateAppointmentStatus(id, status) {
    return api.patch(`/appointments/${id}/status`, { status });
  }
}

export default new LandlordService();