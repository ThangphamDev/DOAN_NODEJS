import api from "@/api/client";
import { invalidatePublicRoomCache } from "@/utils/publicCache";

class AdminService {
  getActiveRoomsCount() {
    return api.get("/admin/rooms/active-count");
  }

  getReportedRooms() {
    return api.get("/admin/rooms/reported");
  }

  getReportedRoomDetail(id) {
    return api.get(`/admin/rooms/reported/${id}`);
  }

  getReportedContent(status = "all") {
    const params = status ? { status } : undefined;
    return api.get("/admin/reports", { params });
  }

  updateReportStatus(reportId, status) {
    return api.patch(`/admin/reports/${reportId}/status`, { status });
  }

  getUsers() {
    return api.get("/admin/users");
  }

  getUserDetail(id) {
    return api.get(`/admin/users/${id}`);
  }

  createUser(payload) {
    return api.post("/admin/users", payload);
  }

  deleteRoom(id) {
    return api.delete(`/admin/rooms/${id}`).then((response) => {
      invalidatePublicRoomCache({ roomId: id });
      return response;
    });
  }

  lockUser(id) {
    return api.patch(`/admin/users/${id}/lock`);
  }

  unlockUser(id) {
    return api.patch(`/admin/users/${id}/unlock`);
  }
}

export default new AdminService();
