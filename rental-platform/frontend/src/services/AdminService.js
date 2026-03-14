import api from "@/api/client";

class AdminService {
  getReportedRooms() {
    return api.get("/admin/rooms/reported");
  }

  getUsers() {
    return api.get("/admin/users");
  }

  deleteRoom(id) {
    return api.delete(`/admin/rooms/${id}`);
  }

  lockUser(id) {
    return api.patch(`/admin/users/${id}/lock`);
  }
}

export default new AdminService();